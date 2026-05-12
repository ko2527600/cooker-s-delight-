<?php

namespace CookersDelight\TableSession\Models;

use Igniter\Flame\Database\Model;

class MenuPrepTime extends Model
{
    protected $table = 'cd_menu_prep_times';

    protected $fillable = ['menu_id', 'prep_time_minutes'];
}
