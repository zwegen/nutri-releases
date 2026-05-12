package com.zwegen.nutri;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.provider.Settings;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;

import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowContentAccess(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(true);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
        webView.addJavascriptInterface(new UpdateBridge(), "NutriUpdateBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
                try {
                    PackageInfo packageInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
                    long versionCode = packageInfo.getLongVersionCode();
                    String versionName = packageInfo.versionName == null ? "" : packageInfo.versionName;
                    String escapedVersionName = escapeForJs(versionName);
                    view.evaluateJavascript("window.__NUTRI_VERSION_CODE__ = " + versionCode + "; window.__NUTRI_VERSION_NAME__ = '" + escapedVersionName + "';", null);
                    checkStartupNetworkAccess();
                } catch (Exception ignored) {
                    checkStartupNetworkAccess();
                }
            }
        });
        webView.setWebChromeClient(new WebChromeClient());

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });

        webView.loadUrl("file:///android_asset/index.html");
    }

    private void checkStartupNetworkAccess() {
        new Thread(() -> {
            boolean available = true;
            String dnsDebug = "";
            try {
                InetAddress.getByName("github.com");
            } catch (Exception error) {
                available = false;
                dnsDebug = buildDnsDebug();
            }
            String escapedDnsDebug = escapeForJs(dnsDebug);
            boolean finalAvailable = available;
            runOnUiThread(() -> webView.evaluateJavascript("window.onNativeNetworkStatus && window.onNativeNetworkStatus({available:" + finalAvailable + ", dns:'" + escapedDnsDebug + "'});", null));
        }).start();
    }

    private static String escapeForJs(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("'", "\\'")
                .replace("\n", " ")
                .replace("\r", " ");
    }

    private static String buildDnsDebug() {
        String[] hosts = {"github.com", "api.github.com", "google.com", "cloudflare.com"};
        StringBuilder result = new StringBuilder();
        for (String host : hosts) {
            if (result.length() > 0) result.append("; ");
            result.append(host).append("=");
            try {
                InetAddress address = InetAddress.getByName(host);
                result.append(address.getHostAddress());
            } catch (Exception e) {
                result.append(e.getClass().getSimpleName());
            }
        }
        return result.toString();
    }

    private class UpdateBridge {
        @JavascriptInterface
        public void openAppSettings() {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.parse("package:" + getPackageName()));
            startActivity(intent);
        }

        @JavascriptInterface
        public void openExternalUrl(String url) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(intent);
            } catch (Exception ignored) {
            }
        }

        @JavascriptInterface
        public void checkForUpdates() {
            new Thread(() -> {
                try {
                    URL url = new URL("https://github.com/zwegen/nutri-releases/releases/latest");
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    connection.setInstanceFollowRedirects(false);
                    connection.setRequestMethod("GET");
                    connection.setRequestProperty("User-Agent", "Nutri");
                    connection.setConnectTimeout(15000);
                    connection.setReadTimeout(15000);

                    int status = connection.getResponseCode();
                    String location = connection.getHeaderField("Location");
                    if ((status < 300 || status >= 400) && location == null) {
                        throw new RuntimeException("HTTP " + status);
                    }

                    String tag = "";
                    if (location != null) {
                        int marker = location.lastIndexOf("/tag/");
                        if (marker >= 0) tag = location.substring(marker + 5);
                    }
                    if (tag.isEmpty()) throw new RuntimeException("No release tag");

                    String version = tag.replaceFirst("^[vV]", "");
                    String apkUrl = "https://github.com/zwegen/nutri-releases/releases/download/" + tag + "/Nutri_" + version + ".apk";

                    String escapedTag = escapeForJs(tag);
                    String escapedUrl = escapeForJs(apkUrl);
                    runOnUiThread(() -> webView.evaluateJavascript("window.onNativeUpdateResult && window.onNativeUpdateResult({tagName:'" + escapedTag + "', apkUrl:'" + escapedUrl + "'});", null));
                } catch (Exception error) {
                    String errorType = escapeForJs(error.getClass().getSimpleName());
                    String errorMessage = escapeForJs(error.getMessage() == null ? "" : error.getMessage());
                    String dnsDebug = escapeForJs(buildDnsDebug());
                    runOnUiThread(() -> webView.evaluateJavascript("window.onNativeUpdateError && window.onNativeUpdateError({type:'" + errorType + "', message:'" + errorMessage + "', dns:'" + dnsDebug + "'});", null));
                }
            }).start();
        }
    }
}
