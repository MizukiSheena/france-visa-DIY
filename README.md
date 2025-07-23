# 🇫🇷 France Visa DIY

一个帮助申请法国签证的智能助手工具，提供完整的签证材料清单检查和个性化求职信生成功能。

## 🌟 在线体验

**网站地址：** https://mizukisheena.github.io/france-visa-DIY/

## ✨ 功能特性

### 📋 智能签证清单
- **完整材料清单**：涵盖法国签证申请所需的所有必要文件
- **状态跟踪**：实时标记每项材料的完成状态
- **问题标记**：可以标记遇到问题的材料项目
- **AI 建议**：针对问题项目提供智能建议和解决方案

### 📝 智能求职信生成
- **个性化生成**：基于签证清单的完成情况生成定制化求职信
- **专业模板**：使用专业的求职信格式和语言
- **实时预览**：即时查看生成的求职信内容
- **一键复制**：方便快速使用生成的内容

### 🔐 安全访问
- **密码保护**：确保敏感信息的安全性
- **本地存储**：数据保存在本地，保护隐私

## 🛠️ 技术栈

### 前端框架
- **React 18** - 现代化的用户界面框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的构建工具和开发服务器

### UI 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Shadcn/ui** - 高质量的 React 组件库
- **Radix UI** - 无障碍的底层 UI 组件
- **Lucide React** - 美观的图标库

### 状态管理与路由
- **React Router** - 客户端路由管理
- **React Hook Form** - 高性能的表单处理
- **TanStack Query** - 强大的数据获取和缓存

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS 后处理器
- **GitHub Actions** - 自动化部署

## 🚀 本地开发

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:8080 查看应用

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📦 部署

本项目使用 GitHub Pages 进行自动部署：

1. **自动部署**：每次推送到 `main` 分支都会自动触发部署
2. **GitHub Actions**：使用自定义工作流进行构建和部署
3. **生产优化**：自动进行代码压缩和优化

### 部署配置
- 构建工具：Vite
- 部署平台：GitHub Pages
- 自动化：GitHub Actions
- 域名：`https://mizukisheena.github.io/france-visa-DIY/`

## 📁 项目结构

```
france-visa-DIY/
├── src/
│   ├── components/          # React 组件
│   │   ├── ui/             # UI 基础组件
│   │   ├── PasswordGate.tsx    # 密码验证组件
│   │   ├── VisaChecklist.tsx   # 签证清单组件
│   │   └── CoverLetterGenerator.tsx # 求职信生成器
│   ├── pages/              # 页面组件
│   │   ├── Index.tsx       # 主页
│   │   └── NotFound.tsx    # 404 页面
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具函数
│   └── main.tsx            # 应用入口
├── public/                 # 静态资源
├── .github/workflows/      # GitHub Actions 配置
└── dist/                   # 构建输出目录
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 感谢所有为法国签证申请提供帮助和建议的朋友们
- 感谢开源社区提供的优秀工具和库
- 特别感谢 [Lovable](https://lovable.dev) 平台的支持

## 📞 联系方式

如果你有任何问题或建议，欢迎通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/MizukiSheena/france-visa-DIY/issues)
- 项目维护者: [@MizukiSheena](https://github.com/MizukiSheena)

---

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**
