/* 站点配置：发布前只需要改这一个文件 */

/* 线上地址：
   1) GitHub Pages（主）  https://lllyyyttt-xxx.github.io/
      源仓库 lllyyyttt-xxx.github.io，发布该目录下的 index.html + assets/
   2) WorkBuddy 托管（备用）https://workbench-lite.app.workbuddy.host/?sharecode=3KNPV3AATS
      发布源是同级 dist/，改完要跑 node _tools/build-dist.js，分享码不能丢。
   GitHub Pages 用的是根目录的 index.html + assets/，两份内容保持一致。 */
window.SITE_CONFIG = {
  product: '工作台',
  version: '1.0.0',
  updatedAt: '2026-11-06',

  /* 留空 = 还没发布，下载按钮会自动降级成「下载地址准备中」 */
  githubRepo: 'lllyyyttt-xxx/workbench',

  desktop: {
    /* 必须与 GitHub Release 里的资产名逐字符一致（区分大小写）。
       实测 Release v1.0.0 的资产名是 workbench.zip，不是「工作台-绿色版-分享版-20261105.zip」
       ——release 正文里写的是旧名字，以实际资产名为准，写错会 404。 */
    fileName: 'workbench.zip',
    sizeLabel: '151.5 MB',
    sha256: 'd95d4e44d3858d1666c62972159e6604c4000cc7f00735ca5f7fca14c7857df3',
    minSystem: 'Windows 10 / 11（64 位）',
    dataDir: '%APPDATA%\\工作台\\'
  },

  mobile: {
    url: 'https://workbench-prod-8207.netlify.app',
    label: '在手机上打开'
  },

  license: 'MIT'
};

(function () {
  var c = window.SITE_CONFIG;
  c.repoUrl = c.githubRepo ? 'https://github.com/' + c.githubRepo : '';

  var base = c.desktop.directUrl ||
    (c.repoUrl ? c.repoUrl + '/releases/latest/download/' + encodeURIComponent(c.desktop.fileName) : '');

  c.desktop.url = base;
  c.desktop.size = c.desktop.sizeLabel || '—';
  c.issuesUrl = c.githubRepo ? c.repoUrl + '/issues' : '';
})();
