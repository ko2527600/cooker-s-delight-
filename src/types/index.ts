// All TypeScript types for the TastyIgniter REST API responses.

export interface TILocation {
  location_id: number;
  location_name: string;
  location_email: string;
  location_telephone: string;
  location_address_1: string;
  location_address_2: string;
  location_city: string;
  location_status: boolean;
  permalink_slug: string;
  opening_hours?: TIOpeningHour[];
}

export interface TIOpeningHour {
  day: number;
  open: string;
  close: string;
  status: boolean;
}

export interface TICategory {
  category_id: number;
  name: string;
  description: string;
  priority: number;
  status: boolean;
}

export interface TIMenuItem {
  menu_id: number;
  menu_name: string;
  menu_description: string;
  menu_price: number;
  menu_status: boolean;
  prep_time_minutes?: number;
  thumb?: string;
  categories?: TICategory[];
  menu_options?: TIMenuOption[];
}

export interface TIMenuOption {
  menu_option_id: number;
  option_name: string;
  required: boolean;
  min_selected: number;
  max_selected: number;
  option_values: TIMenuOptionValue[];
}

export interface TIMenuOptionValue {
  menu_option_value_id: number;
  name: string;
  price: number;
}

export interface TIOrder {
  order_id: number;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  order_type: string;
  location_id: number;
  total_items: number;
  order_total: number;
  processed: boolean;
  status_id: number;
  status: TIOrderStatus;
  created_at: string;
}

export interface TIOrderStatus {
  status_id: number;
  status_name: string;
  status_color: string;
  notify_customer: boolean;
}

export interface TIReservation {
  reservation_id: number;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  guest_num: number;
  reserve_date: string;
  reserve_time: string;
  location_id: number;
  status_id: number;
  comment?: string;
}

export interface TIAnnouncement {
  id: number;
  message: string;
  link?: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

export type ReservationInput = Omit<TIReservation, 'reservation_id' | 'status_id'>;

export type ApiResponse<T> = {
  data: T;
  meta?: {
    pagination?: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
};
