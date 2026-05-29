# 纠结骰子

一个本地 PWA，用来在摇骰子前记录“今天又纠结什么了”，并用方格日历和热力图回看自己的纠结轨迹。

## 本地运行

```bash
python3 -m http.server 4180
```

打开：

```text
http://127.0.0.1:4180
```

数据保存在当前浏览器的 `localStorage` 里。

## 发布到公网

这个项目是纯静态网页，可以直接部署到 Netlify、Vercel、Cloudflare Pages 或 GitHub Pages。

最省事的方式：

1. 打开 Netlify Drop：`https://app.netlify.com/drop`
2. 把整个 `dice-decision-app` 文件夹拖进去
3. Netlify 会生成一个公网网址，手机离开电脑也能打开

发布后，手机访问公网网址，再用浏览器的“添加到主屏幕”即可当作小 App 使用。
