import {
  VerificationCode,
  VerificationStatus,
  PickupVerificationRequest,
  PickupVerificationResult
} from '@/types/physical-stores';
import {
  ICodeGenerator,
  ICodeValidator,
  IVerificationCodeRepository,
  IPickupOrderRepository,
  ILogger,
  IAuditService
} from './interfaces';

// Single Responsibility: Only handles verification code operations
export class VerificationCodeService {
  constructor(
    private readonly codeGenerator: ICodeGenerator,
    private readonly codeValidator: ICodeValidator,
    private readonly verificationRepository: IVerificationCodeRepository,
    private readonly orderRepository: IPickupOrderRepository,
    private readonly logger: ILogger,
    private readonly auditService: IAuditService
  ) {}

  async generatePickupCode(orderId: string, storeId: string): Promise<VerificationCode> {
    try {
      const code = this.codeGenerator.generateSecureCode(6);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      const verificationCode = await this.verificationRepository.create({
        code,
        orderId,
        storeId,
        type: 'pickup',
        status: 'pending',
        expiresAt,
        attempts: 0,
        maxAttempts: 3
      });

      await this.auditService.logCodeGeneration(orderId, 'pickup');
      this.logger.log('info', 'Pickup verification code generated', { orderId, storeId });

      return verificationCode;
    } catch (error) {
      this.logger.error('Failed to generate pickup code', error as Error, { orderId, storeId });
      throw new Error('Failed to generate verification code');
    }
  }

  async verifyPickupCode(request: PickupVerificationRequest): Promise<PickupVerificationResult> {
    const { orderId, verificationCode, storeId, verifiedBy, customerPresent, idVerified } = request;

    try {
      // Find the verification code
      const storedCode = await this.verificationRepository.findByCode(verificationCode);

      if (!storedCode) {
        await this.auditService.logPickupAttempt(orderId, storeId, false, { reason: 'Code not found' });
        return {
          success: false,
          message: 'Código de verificación inválido',
          timestamp: new Date(),
          verifiedBy
        };
      }

      // Validate code ownership and store
      if (storedCode.orderId !== orderId || storedCode.storeId !== storeId) {
        await this.auditService.logPickupAttempt(orderId, storeId, false, { reason: 'Code mismatch' });
        return {
          success: false,
          message: 'Código de verificación no corresponde a esta orden o tienda',
          timestamp: new Date(),
          verifiedBy
        };
      }

      // Check if code is expired
      if (this.codeValidator.isCodeExpired(storedCode.expiresAt)) {
        await this.verificationRepository.updateStatus(storedCode.id, 'expired');
        await this.auditService.logPickupAttempt(orderId, storeId, false, { reason: 'Code expired' });
        return {
          success: false,
          message: 'Código de verificación expirado',
          timestamp: new Date(),
          verifiedBy
        };
      }

      // Check if code is already used
      if (storedCode.status === 'completed') {
        await this.auditService.logPickupAttempt(orderId, storeId, false, { reason: 'Code already used' });
        return {
          success: false,
          message: 'Este código ya ha sido utilizado',
          timestamp: new Date(),
          verifiedBy
        };
      }

      // Check max attempts
      if (storedCode.attempts >= storedCode.maxAttempts) {
        await this.verificationRepository.updateStatus(storedCode.id, 'cancelled');
        await this.auditService.logPickupAttempt(orderId, storeId, false, { reason: 'Max attempts exceeded' });
        return {
          success: false,
          message: 'Código bloqueado por intentos fallidos',
          timestamp: new Date(),
          verifiedBy
        };
      }

      // Validate the actual code
      if (!this.codeValidator.validateCode(verificationCode, storedCode.code)) {
        await this.verificationRepository.incrementAttempts(storedCode.id);
        await this.auditService.logPickupAttempt(orderId, storeId, false, { reason: 'Invalid code' });
        return {
          success: false,
          message: 'Código de verificación incorrecto',
          timestamp: new Date(),
          verifiedBy
        };
      }

      // Get the order
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        await this.auditService.logPickupAttempt(orderId, storeId, false, { reason: 'Order not found' });
        return {
          success: false,
          message: 'Orden no encontrada',
          timestamp: new Date(),
          verifiedBy
        };
      }

      // Check if order is ready for pickup
      if (order.status !== 'ready_for_pickup') {
        await this.auditService.logPickupAttempt(orderId, storeId, false, { reason: 'Order not ready' });
        return {
          success: false,
          message: 'La orden no está lista para recoger',
          timestamp: new Date(),
          verifiedBy
        };
      }

      // All validations passed - complete the pickup
      const pickupTime = new Date();
      await this.verificationRepository.updateStatus(storedCode.id, 'completed');
      await this.orderRepository.markAsPickedUp(orderId, pickupTime, verifiedBy);

      await this.auditService.logPickupAttempt(orderId, storeId, true, {
        customerPresent,
        idVerified,
        notes: request.notes
      });

      this.logger.log('info', 'Pickup completed successfully', {
        orderId,
        storeId,
        verifiedBy,
        customerPresent,
        idVerified
      });

      return {
        success: true,
        order,
        message: 'Entrega completada exitosamente',
        timestamp: pickupTime,
        verifiedBy
      };

    } catch (error) {
      this.logger.error('Failed to verify pickup code', error as Error, { orderId, storeId });
      await this.auditService.logPickupAttempt(orderId, storeId, false, { reason: 'System error' });

      return {
        success: false,
        message: 'Error del sistema. Intente nuevamente.',
        timestamp: new Date(),
        verifiedBy
      };
    }
  }

  async cleanupExpiredCodes(): Promise<number> {
    try {
      const deletedCount = await this.verificationRepository.deleteExpired();
      this.logger.log('info', 'Expired verification codes cleaned up', { deletedCount });
      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup expired codes', error as Error);
      return 0;
    }
  }

  async generateQRCodeForOrder(orderId: string): Promise<string> {
    try {
      const codes = await this.verificationRepository.findByOrderId(orderId);
      const activeCode = codes.find(code => code.status === 'pending');

      if (!activeCode) {
        throw new Error('No active verification code found for order');
      }

      const qrData = JSON.stringify({
        orderId: activeCode.orderId,
        code: activeCode.code,
        storeId: activeCode.storeId,
        type: 'pickup'
      });

      return await this.codeGenerator.generateQRCode(qrData);
    } catch (error) {
      this.logger.error('Failed to generate QR code for order', error as Error, { orderId });
      throw new Error('Failed to generate QR code');
    }
  }
}