// PostHog Event Tracking for E-commerce

export const ECOMMERCE_EVENTS = {
  // User Events
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Product Events
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_LIST_VIEWED: 'product_list_viewed',
  PRODUCT_ADDED_TO_CART: 'product_added_to_cart',
  PRODUCT_REMOVED_FROM_CART: 'product_removed_from_cart',
  PRODUCT_ADDED_TO_FAVORITES: 'product_added_to_favorites',
  PRODUCT_REMOVED_FROM_FAVORITES: 'product_removed_from_favorites',

  // Cart Events
  CART_VIEWED: 'cart_viewed',
  CART_ABANDONED: 'cart_abandoned',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
  ORDER_PLACED: 'order_placed',

  // Page Events
  PAGE_VIEWED: 'page_viewed',
  SEARCH_PERFORMED: 'search_performed',
  CATEGORY_VIEWED: 'category_viewed',

  // Form Events
  FORM_SUBMITTED: 'form_submitted',
  NEWSLETTER_SUBSCRIBED: 'newsletter_subscribed',
  CONTACT_FORM_SUBMITTED: 'contact_form_submitted',

  // Navigation Events
  BROWSE_ABANDONMENT: 'browse_abandonment',
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',

  // Campaign Events
  EMAIL_OPENED: 'email_opened',
  EMAIL_CLICKED: 'email_clicked',
  SMS_RECEIVED: 'sms_received',
  WHATSAPP_RECEIVED: 'whatsapp_received',
  INWEB_NOTIFICATION_SHOWN: 'inweb_notification_shown',
  INWEB_NOTIFICATION_CLICKED: 'inweb_notification_clicked',
} as const;

export type EcommerceEventType = typeof ECOMMERCE_EVENTS[keyof typeof ECOMMERCE_EVENTS];

// Event property interfaces
export interface ProductEventProperties {
  product_id: string;
  product_name: string;
  product_category: string;
  product_price: number;
  product_sku?: string;
  product_brand?: string;
  product_variant?: string;
}

export interface CartEventProperties {
  cart_id?: string;
  cart_value: number;
  item_count: number;
  currency: string;
  products: ProductEventProperties[];
}

export interface PageEventProperties {
  page_url: string;
  page_title: string;
  page_type: 'home' | 'product' | 'category' | 'cart' | 'checkout' | 'account' | 'other';
  referrer?: string;
  time_on_page?: number;
}

export interface UserEventProperties {
  user_id?: string;
  user_email?: string;
  user_segment?: 'new' | 'returning' | 'vip' | 'inactive';
  registration_source?: string;
  login_method?: 'email' | 'social' | 'phone';
}

export interface SearchEventProperties {
  search_query: string;
  search_results_count: number;
  search_category?: string;
  search_filters?: Record<string, any>;
}

export interface FormEventProperties {
  form_id: string;
  form_name: string;
  form_type: 'contact' | 'newsletter' | 'registration' | 'feedback' | 'other';
  success: boolean;
  errors?: string[];
}

export interface CampaignEventProperties {
  campaign_id: string;
  campaign_name: string;
  campaign_type: 'email' | 'sms' | 'whatsapp' | 'inweb';
  message_id?: string;
  template_id?: string;
  user_id: string;
}

// Helper functions for common event patterns
export function createProductViewEvent(
  product: ProductEventProperties,
  user?: UserEventProperties
): { event: EcommerceEventType; properties: Record<string, any> } {
  return {
    event: ECOMMERCE_EVENTS.PRODUCT_VIEWED,
    properties: {
      ...product,
      ...user,
      timestamp: new Date().toISOString(),
    },
  };
}

export function createCartAbandonmentEvent(
  cart: CartEventProperties,
  user?: UserEventProperties,
  timeOnPage?: number
): { event: EcommerceEventType; properties: Record<string, any> } {
  return {
    event: ECOMMERCE_EVENTS.CART_ABANDONED,
    properties: {
      ...cart,
      ...user,
      time_on_page: timeOnPage,
      timestamp: new Date().toISOString(),
    },
  };
}

export function createAddToCartEvent(
  product: ProductEventProperties,
  cart: Partial<CartEventProperties>,
  user?: UserEventProperties
): { event: EcommerceEventType; properties: Record<string, any> } {
  return {
    event: ECOMMERCE_EVENTS.PRODUCT_ADDED_TO_CART,
    properties: {
      ...product,
      cart_value: cart.cart_value,
      item_count: cart.item_count,
      ...user,
      timestamp: new Date().toISOString(),
    },
  };
}

export function createPageViewEvent(
  page: PageEventProperties,
  user?: UserEventProperties
): { event: EcommerceEventType; properties: Record<string, any> } {
  return {
    event: ECOMMERCE_EVENTS.PAGE_VIEWED,
    properties: {
      ...page,
      ...user,
      timestamp: new Date().toISOString(),
    },
  };
}

export function createUserRegistrationEvent(
  user: UserEventProperties
): { event: EcommerceEventType; properties: Record<string, any> } {
  return {
    event: ECOMMERCE_EVENTS.USER_REGISTERED,
    properties: {
      ...user,
      timestamp: new Date().toISOString(),
    },
  };
}

export function createFormSubmissionEvent(
  form: FormEventProperties,
  user?: UserEventProperties
): { event: EcommerceEventType; properties: Record<string, any> } {
  return {
    event: ECOMMERCE_EVENTS.FORM_SUBMITTED,
    properties: {
      ...form,
      ...user,
      timestamp: new Date().toISOString(),
    },
  };
}

export function createCampaignInteractionEvent(
  eventType: EcommerceEventType,
  campaign: CampaignEventProperties
): { event: EcommerceEventType; properties: Record<string, any> } {
  return {
    event: eventType,
    properties: {
      ...campaign,
      timestamp: new Date().toISOString(),
    },
  };
}

// Event validation
export function validateEventProperties(
  eventType: EcommerceEventType,
  properties: Record<string, any>
): boolean {
  // Basic validation - can be extended
  switch (eventType) {
    case ECOMMERCE_EVENTS.PRODUCT_VIEWED:
      return !!(properties.product_id && properties.product_name);

    case ECOMMERCE_EVENTS.CART_ABANDONED:
      return !!(properties.cart_value !== undefined && properties.item_count !== undefined);

    case ECOMMERCE_EVENTS.USER_REGISTERED:
      return !!(properties.user_id || properties.user_email);

    case ECOMMERCE_EVENTS.PAGE_VIEWED:
      return !!(properties.page_url && properties.page_title);

    default:
      return true; // Allow other events through
  }
}