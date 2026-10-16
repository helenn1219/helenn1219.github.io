# Helen Hsieh — UI/UX Portfolio

謝孟庭的 UI/UX 作品集網站，純 HTML／CSS／JS，沒有建置步驟。

- 網址（GitHub Pages）：https://helenn1219.github.io/
- 本機預覽：用 VS Code 開啟這個資料夾，按右下角「Go Live」（Live Server 擴充套件）。

## 結構

| 路徑 | 內容 |
|---|---|
| `index.html` | 首頁 |
| `works/*-light.html` | 五個案例頁（埔里、滿意寶寶、鴻海、史博館、麻吉） |
| `css/home-v3-apply.css`、`js/home-v3-apply*.js` | 首頁樣式與互動（Hero、專案、更多作品） |
| `css/site-footer.css`、`js/site-footer.js` | 全站共用頁尾（含上緣彈跳） |
| `css/about-avatar.css`、`js/about-avatar.js` | About 互動立繪 |
| `css/site-brand.css` | 案例頁品牌色 |
| `js/vendor/gsap-3.13.0/` | GSAP（首頁 Hero 與更多作品），授權見 LICENSE-NOTE.txt |
| `img/`、`video/`、`demo/`、`cv/` | 素材、影片、互動 Demo、履歷 |
| `lab/` | 本機試作頁，不上傳（見 .gitignore） |

## 注意

- 加入檔案時逐一 `git add <路徑>`，不要用 `git add .`。
- 改網址時，同步修改各頁的 canonical、og:url、og:image。
