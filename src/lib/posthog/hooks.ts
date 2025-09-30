'use client';

import { usePostHog } from './provider';
import {
  EcommerceEventType,
  ProductEventProperties,
  CartEventProperties,
  PageEventProperties,
  UserEventProperties,
  SearchEventProperties,
  FormEventProperties,
  CampaignEventProperties,
  ECOMMERCE_EVENTS,
  createProductViewEvent,
  createCartAbandonmentEvent,
  createAddToCartEvent,
  createPageViewEvent,
  createUserRegistrationEvent,
  createFormSubmissionEvent,
  createCampaignInteractionEvent,
  validateEventProperties,
} from './events';

export function useEcommerceTracking() {
  const { trackEvent, identifyUser, isInitialized } = usePostHog();

  // Product tracking
  const trackProductView = (product: ProductEventProperties, user?: UserEventProperties) => {
    if (!isInitialized) return;

    const { event, properties } = createProductViewEvent(product, user);
    if (validateEventProperties(event, properties)) {
      trackEvent(event, properties);
    }
  };

  const trackAddToCart = (
    product: ProductEventProperties,
    cart: Partial<CartEventProperties>,
    user?: UserEventProperties
  ) => {
    if (!isInitialized) return;

    const { event, properties } = createAddToCartEvent(product, cart, user);
    if (validateEventProperties(event, properties)) {
      trackEvent(event, properties);
    }
  };

  const trackAddToFavorites = (product: ProductEventProperties, user?: UserEventProperties) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.PRODUCT_ADDED_TO_FAVORITES, {
      ...product,
      ...user,
      timestamp: new Date().toISOString(),
    });
  };

  const trackRemoveFromCart = (product: ProductEventProperties, user?: UserEventProperties) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.PRODUCT_REMOVED_FROM_CART, {
      ...product,
      ...user,
      timestamp: new Date().toISOString(),
    });
  };

  // Cart tracking
  const trackCartView = (cart: CartEventProperties, user?: UserEventProperties) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.CART_VIEWED, {
      ...cart,
      ...user,
      timestamp: new Date().toISOString(),
    });
  };

  const trackCartAbandonment = (
    cart: CartEventProperties,
    user?: UserEventProperties,
    timeOnPage?: number
  ) => {
    if (!isInitialized) return;

    const { event, properties } = createCartAbandonmentEvent(cart, user, timeOnPage);
    if (validateEventProperties(event, properties)) {
      trackEvent(event, properties);
    }
  };

  const trackCheckoutStarted = (cart: CartEventProperties, user?: UserEventProperties) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.CHECKOUT_STARTED, {
      ...cart,
      ...user,
      timestamp: new Date().toISOString(),
    });
  };

  const trackOrderPlaced = (
    order: CartEventProperties & { order_id: string },
    user?: UserEventProperties
  ) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.ORDER_PLACED, {
      ...order,
      ...user,
      timestamp: new Date().toISOString(),
    });
  };

  // Page tracking
  const trackPageView = (page: PageEventProperties, user?: UserEventProperties) => {
    if (!isInitialized) return;

    const { event, properties } = createPageViewEvent(page, user);
    if (validateEventProperties(event, properties)) {
      trackEvent(event, properties);
    }
  };

  const trackSearch = (search: SearchEventProperties, user?: UserEventProperties) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.SEARCH_PERFORMED, {
      ...search,
      ...user,
      timestamp: new Date().toISOString(),
    });
  };

  const trackCategoryView = (
    category: { category_name: string; category_id?: string },
    user?: UserEventProperties
  ) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.CATEGORY_VIEWED, {
      ...category,
      ...user,
      timestamp: new Date().toISOString(),
    });
  };

  // User tracking
  const trackUserRegistration = (user: UserEventProperties) => {
    if (!isInitialized) return;

    const { event, properties } = createUserRegistrationEvent(user);
    if (validateEventProperties(event, properties)) {
      trackEvent(event, properties);
      if (user.user_id) {
        identifyUser(user.user_id, user);
      }
    }
  };

  const trackUserLogin = (user: UserEventProperties) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.USER_LOGIN, {
      ...user,
      timestamp: new Date().toISOString(),
    });

    if (user.user_id) {
      identifyUser(user.user_id, user);
    }
  };

  // Form tracking
  const trackFormSubmission = (form: FormEventProperties, user?: UserEventProperties) => {
    if (!isInitialized) return;

    const { event, properties } = createFormSubmissionEvent(form, user);
    if (validateEventProperties(event, properties)) {
      trackEvent(event, properties);
    }
  };

  const trackNewsletterSubscription = (
    email: string,
    source?: string,
    user?: UserEventProperties
  ) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.NEWSLETTER_SUBSCRIBED, {
      email,
      subscription_source: source,
      ...user,
      timestamp: new Date().toISOString(),
    });
  };

  // Campaign tracking
  const trackCampaignEvent = (
    eventType: EcommerceEventType,
    campaign: CampaignEventProperties
  ) => {
    if (!isInitialized) return;

    const { event, properties } = createCampaignInteractionEvent(eventType, campaign);
    trackEvent(event, properties);
  };

  const trackEmailOpened = (campaign: CampaignEventProperties) => {
    trackCampaignEvent(ECOMMERCE_EVENTS.EMAIL_OPENED, campaign);
  };

  const trackEmailClicked = (campaign: CampaignEventProperties) => {
    trackCampaignEvent(ECOMMERCE_EVENTS.EMAIL_CLICKED, campaign);
  };

  const trackInWebNotificationShown = (campaign: CampaignEventProperties) => {
    trackCampaignEvent(ECOMMERCE_EVENTS.INWEB_NOTIFICATION_SHOWN, campaign);
  };

  const trackInWebNotificationClicked = (campaign: CampaignEventProperties) => {
    trackCampaignEvent(ECOMMERCE_EVENTS.INWEB_NOTIFICATION_CLICKED, campaign);
  };

  // Session tracking
  const trackSessionStart = (user?: UserEventProperties) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.SESSION_STARTED, {
      ...user,
      timestamp: new Date().toISOString(),
    });
  };

  const trackBrowseAbandonment = (
    timeOnSite: number,
    pagesViewed: number,
    user?: UserEventProperties
  ) => {
    if (!isInitialized) return;

    trackEvent(ECOMMERCE_EVENTS.BROWSE_ABANDONMENT, {
      time_on_site: timeOnSite,
      pages_viewed: pagesViewed,
      ...user,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    // Product tracking
    trackProductView,
    trackAddToCart,
    trackAddToFavorites,
    trackRemoveFromCart,

    // Cart tracking
    trackCartView,
    trackCartAbandonment,
    trackCheckoutStarted,
    trackOrderPlaced,

    // Page tracking
    trackPageView,
    trackSearch,
    trackCategoryView,

    // User tracking
    trackUserRegistration,
    trackUserLogin,

    // Form tracking
    trackFormSubmission,
    trackNewsletterSubscription,

    // Campaign tracking
    trackCampaignEvent,
    trackEmailOpened,
    trackEmailClicked,
    trackInWebNotificationShown,
    trackInWebNotificationClicked,

    // Session tracking
    trackSessionStart,
    trackBrowseAbandonment,

    // Utilities
    isInitialized,
  };
}