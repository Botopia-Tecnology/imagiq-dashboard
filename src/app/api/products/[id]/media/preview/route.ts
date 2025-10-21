import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/products/[id]/media/preview
 * Elimina la imagen preview de un producto específico
 *
 * @param id - codigoMarketBase del producto
 * @param request - Request body con el SKU del color
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: codigoMarketBase } = params;
    const body = await request.json();
    const { sku } = body;

    // Validación básica
    if (!sku) {
      return NextResponse.json(
        {
          success: false,
          message: "SKU es requerido",
        },
        { status: 400 }
      );
    }

    // Aquí se haría la petición al microservicio de productos
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const backendUrl = `${API_BASE_URL}/api/multimedia/producto/${sku}/imagen-preview`;

    // Reenviar la petición DELETE al backend
    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Error al eliminar imagen preview",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Imagen preview eliminada correctamente",
      data,
    });
  } catch (error) {
    console.error("Error deleting preview image:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

