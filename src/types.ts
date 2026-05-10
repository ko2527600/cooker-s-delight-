/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: 'Ghanaian' | 'Nigerian' | 'Fast Food' | 'Continental' | 'Snacks' | 'Sides';
  image?: string;
}

export interface Branch {
  name: string;
  area: string;
  landmark: string;
  phone: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}
