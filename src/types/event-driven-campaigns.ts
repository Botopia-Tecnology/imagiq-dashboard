// Event-Driven Campaign Types

export type EventTriggerType =
  | 'abandoned_cart'
  | 'product_view'
  | 'add_to_favorites'
  | 'browse_abandonment'
  | 'page_view'
  | 'user_registration'
  | 'purchase_event'
  | 'form_submission'
  | 'time_delay';

export type CommunicationChannelType =
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'inweb';

export type UserSegmentType =
  | 'all_users'
  | 'new_users'
  | 'returning_users'
  | 'vip_users'
  | 'inactive_users';

export type FilterConditionType =
  | 'cart_value'
  | 'user_segment'
  | 'geographic_location'
  | 'time_since_event'
  | 'previous_behavior'
  | 'device_type'
  | 'traffic_source';

export type ConditionalLogicType =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty';

export type WaitTriggerType =
  | 'time_delay'
  | 'wait_for_event'
  // | 'wait_for_condition'
  | 'wait_for_webhook';

// Base Node interface
export interface BaseFlowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay' | 'if' | 'wait';
  position: { x: number; y: number };
  data: any;
}

// Trigger Node
export interface TriggerNode extends BaseFlowNode {
  type: 'trigger';
  data: {
    triggerType: EventTriggerType;
    config: TriggerConfig;
    label: string;
    icon: string;
  };
}

// Condition Node
export interface ConditionNode extends BaseFlowNode {
  type: 'condition';
  data: {
    conditions: FilterCondition[];
    operator: 'AND' | 'OR';
    label: string;
    icon: string;
  };
}

// Action Node
export interface ActionNode extends BaseFlowNode {
  type: 'action';
  data: {
    channel: CommunicationChannelType;
    config: ActionConfig;
    label: string;
    icon: string;
  };
}

// Delay Node
export interface DelayNode extends BaseFlowNode {
  type: 'delay';
  data: {
    delayAmount: number;
    delayUnit: 'minutes' | 'hours' | 'days';
    label: string;
    icon: string;
  };
}

// IF Conditional Node
export interface IfNode extends BaseFlowNode {
  type: 'if';
  data: {
    conditions: ConditionalRule[];
    operator: 'AND' | 'OR';
    label: string;
    icon: string;
    trueOutputs: string[]; // Node IDs for true branch
    falseOutputs: string[]; // Node IDs for false branch
  };
}

// Wait Node
export interface WaitNode extends BaseFlowNode {
  type: 'wait';
  data: {
    waitType: WaitTriggerType;
    config: WaitConfig;
    label: string;
    icon: string;
    timeout?: {
      amount: number;
      unit: 'minutes' | 'hours' | 'days';
    };
  };
}

// Union type for all node types
export type FlowNode = TriggerNode | ConditionNode | ActionNode | DelayNode | IfNode | WaitNode;

// Trigger Configurations
export interface TriggerConfig {
  abandoned_cart?: {
    timeThreshold: number; // minutes
    minCartValue?: number;
  };
  product_view?: {
    productIds?: string[];
    categories?: string[];
    viewDuration?: number; // seconds
  };
  add_to_favorites?: {
    productIds?: string[];
    categories?: string[];
  };
  browse_abandonment?: {
    timeThreshold: number; // minutes
    pagesViewed?: number;
  };
  page_view?: {
    pageUrls: string[];
    timeOnPage?: number; // seconds
  };
  user_registration?: {
    registrationSource?: string;
  };
  purchase_event?: {
    minOrderValue?: number;
    maxOrderValue?: number;
    productCategories?: string[];
  };
  form_submission?: {
    formIds: string[];
  };
  time_delay?: {
    amount: number;
    unit: 'minutes' | 'hours' | 'days';
  };
}

// Filter Conditions
export interface FilterCondition {
  type: FilterConditionType;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  field?: string;
}

// Action Configurations
export interface ActionConfig {
  email?: {
    templateId: string;
    subject: string;
    personalization?: Record<string, any>;
  };
  sms?: {
    templateId: string;
    message: string;
    personalization?: Record<string, any>;
  };
  whatsapp?: {
    templateId: string;
    message: string;
    mediaUrl?: string;
    personalization?: Record<string, any>;
  };
  inweb?: {
    type: 'popup' | 'banner' | 'notification';
    content: string;
    position?: 'top' | 'bottom' | 'center';
    duration?: number; // seconds
    personalization?: Record<string, any>;
  };
}

// Campaign Flow
export interface EventDrivenCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  metrics?: CampaignMetrics;
}

// Flow Edge
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: {
    condition?: string;
    label?: string;
  };
}

// Campaign Metrics
export interface CampaignMetrics {
  triggered: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  lastUpdated: Date;
}

// PostHog Event Structure
export interface PostHogEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  distinct_id: string;
}

// User Context for campaign execution
export interface UserContext {
  userId: string;
  email?: string;
  phone?: string;
  segment: UserSegmentType;
  properties: Record<string, any>;
  lastActivity: Date;
  cartValue?: number;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
}

// Execution Context
export interface CampaignExecutionContext {
  campaignId: string;
  userId: string;
  triggerEvent: PostHogEvent;
  userContext: UserContext;
  nodeHistory: string[];
  startTime: Date;
}

// Conditional Rule for IF nodes
export interface ConditionalRule {
  field: string;
  operator: ConditionalLogicType;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

// Wait Configuration
export interface WaitConfig {
  time_delay?: {
    amount: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  wait_for_event?: {
    eventName: string;
    timeout?: {
      amount: number;
      unit: 'minutes' | 'hours' | 'days';
    };
  };
  wait_for_condition?: {
    conditions: ConditionalRule[];
    operator: 'AND' | 'OR';
    checkInterval: number; // minutes
    timeout?: {
      amount: number;
      unit: 'minutes' | 'hours' | 'days';
    };
  };
  wait_for_webhook?: {
    webhookUrl: string;
    expectedData?: Record<string, any>;
    timeout?: {
      amount: number;
      unit: 'minutes' | 'hours' | 'days';
    };
  };
}