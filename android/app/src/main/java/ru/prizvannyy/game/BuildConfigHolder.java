package ru.prizvannyy.game;

import android.content.Context;

final class BuildConfigHolder {
    static String versionName(Context c) {
        try { return c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionName; }
        catch (Exception e) { return "?"; }
    }
}
