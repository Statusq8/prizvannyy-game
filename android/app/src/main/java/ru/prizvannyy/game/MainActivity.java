package ru.prizvannyy.game;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;

/** Обёртка игры: WebView с index.html из assets. Сохранение — localStorage + копия в файле приложения. */
public class MainActivity extends Activity {
    private WebView web;
    private boolean paused = false;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient());
        web.addJavascriptInterface(new Bridge(), "PZNative");
        setContentView(web);
        immersive();
        if (state != null) web.restoreState(state);
        else web.loadUrl("file:///android_asset/index.html");
    }

    private void immersive() {
        web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) immersive(); }

    @Override protected void onPause() {
        // Свернули: сохранить прогресс, заглушить звук, остановить игру (офлайн-награда начислится при возвращении)
        if (web != null) {
            web.evaluateJavascript("try{PZ.app.saveNow()}catch(e){};try{PZ.audio.suspend()}catch(e){}", v -> { if (paused) { web.onPause(); web.pauseTimers(); } });
        }
        paused = true;
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume();
        if (web != null && paused) {
            web.onResume(); web.resumeTimers();
            web.evaluateJavascript("try{PZ.audio.resume()}catch(e){}", null);
        }
        paused = false;
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

    @Override public void onBackPressed() {
        // «Назад» закрывает окно в игре; если окон нет — сворачивает приложение (не убивает его)
        web.evaluateJavascript("(function(){try{return PZ.ui.modal.close()?1:0}catch(e){}return 0})()", v -> {
            if (!"1".equals(v)) moveTaskToBack(true);
        });
    }

    private File backupFile() { return new File(getFilesDir(), "save_backup.json"); }

    /** Методы, доступные из игры как window.PZNative */
    private class Bridge {
        @JavascriptInterface public String platform() { return "android"; }
        @JavascriptInterface public String version() { return BuildConfigHolder.versionName(MainActivity.this); }

        @JavascriptInterface public void backup(String text) {
            try (FileOutputStream o = new FileOutputStream(backupFile())) { o.write(text.getBytes(StandardCharsets.UTF_8)); }
            catch (Exception ignored) { }
        }

        @JavascriptInterface public String restore() {
            File f = backupFile();
            if (!f.exists()) return "";
            try (FileInputStream i = new FileInputStream(f)) {
                byte[] b = new byte[(int) f.length()];
                int n = i.read(b);
                return new String(b, 0, Math.max(0, n), StandardCharsets.UTF_8);
            } catch (Exception e) { return ""; }
        }

        @JavascriptInterface public void shareText(String title, String text) {
            runOnUiThread(() -> {
                Intent send = new Intent(Intent.ACTION_SEND);
                send.setType("text/plain");
                send.putExtra(Intent.EXTRA_SUBJECT, title);
                send.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(send, title));
            });
        }
    }
}
