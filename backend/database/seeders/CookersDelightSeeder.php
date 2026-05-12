<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CookersDelightSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedLocations();
        $this->seedCategories();
        $this->seedMenuItems();
        $this->seedOrderStatuses();
        $this->seedStaffGroups();
        $this->seedDiningTables();
        $this->seedPrepTimes();
    }

    private function seedLocations(): void
    {
        $locations = [
            ['location_name' => 'Kaneshie – Main Branch',  'location_address_1' => 'Kaneshie Main Road',  'location_address_2' => 'Opposite Cocoa Clinic', 'permalink_slug' => 'kaneshie',   'is_default' => 1],
            ['location_name' => 'Circle – Business Hub',   'location_address_1' => 'Circle Interchange',  'location_address_2' => 'American Mall',          'permalink_slug' => 'circle',     'is_default' => 0],
            ['location_name' => 'East Legon',              'location_address_1' => 'Legon Link Road',     'location_address_2' => 'Near Police Station',    'permalink_slug' => 'east-legon', 'is_default' => 0],
            ['location_name' => 'Swan Lake – North Accra', 'location_address_1' => 'Swan Lake Area',      'location_address_2' => 'CPP Junction',           'permalink_slug' => 'swan-lake',  'is_default' => 0],
        ];

        foreach ($locations as $loc) {
            DB::table('locations')->updateOrInsert(
                ['permalink_slug' => $loc['permalink_slug']],
                array_merge($loc, [
                    'location_email'      => strtolower(Str::slug($loc['location_name'])) . '@cookersdelight.com',
                    'location_city'       => 'Accra',
                    'location_country_id' => 83,
                    'location_telephone'  => '+233243379412',
                    'location_status'     => 1,
                    'updated_at'          => now(),
                    'created_at'          => now(),
                ])
            );
        }

        $this->command->info('Locations seeded.');
    }

    private function seedCategories(): void
    {
        $categories = [
            ['name' => 'Ghanaian',    'description' => 'Authentic Ghanaian dishes',          'priority' => 1],
            ['name' => 'Nigerian',    'description' => 'Classic Nigerian recipes',            'priority' => 2],
            ['name' => 'Fast Food',   'description' => 'Burgers, pizza, shawarma and more',  'priority' => 3],
            ['name' => 'Continental', 'description' => 'International favourites',            'priority' => 4],
            ['name' => 'Snacks',      'description' => 'Light bites and pastries',           'priority' => 5],
            ['name' => 'Sides',       'description' => 'Plantain, salads and accompaniments','priority' => 6],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(
                ['name' => $cat['name']],
                array_merge($cat, [
                    'status'         => 1,
                    'permalink_slug' => Str::slug($cat['name']),
                    'updated_at'     => now(),
                    'created_at'     => now(),
                ])
            );
        }

        $this->command->info('Categories seeded.');
    }

    private function seedMenuItems(): void
    {
        $items = [
            ['menu_name' => 'Jollof Rice Special',  'menu_price' => 45.00, 'category' => 'Ghanaian',    'menu_description' => 'Iconic Ghanaian Jollof with grilled chicken, salad, shito'],
            ['menu_name' => 'Banku & Tilapia',      'menu_price' => 65.00, 'category' => 'Ghanaian',    'menu_description' => 'Freshly grilled tilapia with banku, hot pepper'],
            ['menu_name' => 'Seafood Okra',         'menu_price' => 55.00, 'category' => 'Ghanaian',    'menu_description' => 'Rich okra soup with crab, fish, wele'],
            ['menu_name' => 'Egusi Soup',           'menu_price' => 55.00, 'category' => 'Nigerian',    'menu_description' => 'Melon seed soup with spinach and assorted meats'],
            ['menu_name' => 'Famous Meat Pie',      'menu_price' => 15.00, 'category' => 'Snacks',      'menu_description' => 'Golden flaky pastry with savory minced meat'],
            ['menu_name' => 'Spicy Kelewele',       'menu_price' => 20.00, 'category' => 'Sides',       'menu_description' => 'Fried plantain with ginger, pepper, spices'],
            ['menu_name' => 'Special Fried Rice',   'menu_price' => 50.00, 'category' => 'Continental', 'menu_description' => 'Savory fried rice with assorted vegetables and protein'],
            ['menu_name' => 'Plain Rice & Stew',    'menu_price' => 40.00, 'category' => 'Ghanaian',    'menu_description' => 'Authentic Ghanaian tomato stew with plain rice'],
            ['menu_name' => 'House Pizza',          'menu_price' => 80.00, 'category' => 'Fast Food',   'menu_description' => 'Freshly baked with premium toppings'],
            ['menu_name' => 'Chicken Shawarma',     'menu_price' => 35.00, 'category' => 'Fast Food',   'menu_description' => 'Spiced chicken, fresh veggies, cream sauce'],
        ];

        foreach ($items as $item) {
            $categoryId = DB::table('categories')->where('name', $item['category'])->value('category_id');
            if (!$categoryId) continue;

            if (!DB::table('menus')->where('menu_name', $item['menu_name'])->exists()) {
                $menuId = DB::table('menus')->insertGetId([
                    'menu_name'         => $item['menu_name'],
                    'menu_description'  => $item['menu_description'],
                    'menu_price'        => $item['menu_price'],
                    'menu_status'       => 1,
                    'minimum_qty'       => 1,
                    'order_restriction' => null,
                    'updated_at'        => now(),
                    'created_at'        => now(),
                ]);

                DB::table('menu_categories')->insertOrIgnore([
                    'menu_id'     => $menuId,
                    'category_id' => $categoryId,
                ]);
            }
        }

        $this->command->info('Menu items seeded (' . count($items) . ' items).');
    }

    private function seedOrderStatuses(): void
    {
        $statuses = [
            ['status_name' => 'Pending',   'status_color' => '#f59e0b', 'notify_customer' => 1],
            ['status_name' => 'Received',  'status_color' => '#3b82f6', 'notify_customer' => 1],
            ['status_name' => 'Preparing', 'status_color' => '#8b5cf6', 'notify_customer' => 1],
            ['status_name' => 'Ready',     'status_color' => '#10b981', 'notify_customer' => 1],
            ['status_name' => 'Served',    'status_color' => '#06b6d4', 'notify_customer' => 0],
            ['status_name' => 'Cancelled', 'status_color' => '#ef4444', 'notify_customer' => 1],
        ];

        foreach ($statuses as $status) {
            DB::table('statuses')->updateOrInsert(
                ['status_name' => $status['status_name']],
                array_merge($status, [
                    'status_for' => 'order',
                    'updated_at' => now(),
                    'created_at' => now(),
                ])
            );
        }

        $this->command->info('Order statuses seeded.');
    }

    private function seedStaffGroups(): void
    {
        foreach (['Admins', 'Waiters', 'Cashiers', 'Kitchen'] as $name) {
            DB::table('admin_user_groups')->updateOrInsert(
                ['user_group_name' => $name],
                ['user_group_name' => $name, 'auto_assign' => 0, 'updated_at' => now(), 'created_at' => now()]
            );
        }

        $this->command->info('Staff groups seeded.');
    }

    /**
     * Seed 10 tables per location, each with a unique stable token.
     * These table IDs are what get printed on QR cards.
     */
    private function seedDiningTables(): void
    {
        $locations = DB::table('locations')->pluck('location_id');
        $seeded = 0;

        foreach ($locations as $locationId) {
            for ($tableNum = 1; $tableNum <= 10; $tableNum++) {
                $exists = DB::table('cd_dining_tables')
                    ->where('location_id', $locationId)
                    ->where('table_number', (string) $tableNum)
                    ->exists();

                if (!$exists) {
                    DB::table('cd_dining_tables')->insert([
                        'location_id'  => $locationId,
                        'table_number' => (string) $tableNum,
                        'stable_token' => Str::uuid()->toString(),
                        'capacity'     => 4,
                        'is_active'    => 1,
                        'created_at'   => now(),
                        'updated_at'   => now(),
                    ]);
                    $seeded++;
                }
            }
        }

        $this->command->info("Dining tables seeded ({$seeded} new tables across " . count($locations) . ' locations).');
    }

    /**
     * Seed realistic prep times for each menu item.
     * Kitchen prep time drives the estimated wait shown in cart.
     */
    private function seedPrepTimes(): void
    {
        $prepTimes = [
            'Jollof Rice Special'  => 20,
            'Banku & Tilapia'      => 25,
            'Seafood Okra'         => 30,
            'Egusi Soup'           => 25,
            'Famous Meat Pie'      => 10,
            'Spicy Kelewele'       => 10,
            'Special Fried Rice'   => 18,
            'Plain Rice & Stew'    => 15,
            'House Pizza'          => 22,
            'Chicken Shawarma'     => 12,
        ];

        foreach ($prepTimes as $name => $minutes) {
            $menuId = DB::table('menus')->where('menu_name', $name)->value('menu_id');
            if (!$menuId) continue;

            DB::table('cd_menu_prep_times')->updateOrInsert(
                ['menu_id' => $menuId],
                ['prep_time_minutes' => $minutes, 'updated_at' => now(), 'created_at' => now()]
            );
        }

        $this->command->info('Prep times seeded (' . count($prepTimes) . ' items).');
    }
}
