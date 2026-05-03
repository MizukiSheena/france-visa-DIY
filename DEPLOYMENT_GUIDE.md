# 部署指南

## 🎉 部署成功！

项目已成功部署到 GitHub Pages！

## 🌐 访问地址

**网站地址**: https://mizukisheena.github.io/france-visa-DIY/

**访问码**: francevisa2026

## 📋 用户使用流程

1. **访问网站**
   - 用户访问上述链接

2. **输入访问码**
   - 输入访问码：`francevisa2026`
   - 点击"进入系统"按钮

3. **使用签证材料清单**
   - 查看完整的16项签证材料清单
   - 标记已完成的材料
   - 如遇问题可标记并获取AI建议

4. **使用AI服务**
   - 免费用户可使用3次AI服务
   - 包括AI建议和Cover Letter生成
   - 超过限制后会提示配置自己的API Key

5. **获取更多使用次数**
   - 用户可访问智谱AI官网：https://open.bigmodel.cn/
   - 注册并获取自己的GLM API Key
   - 在应用中配置API Key获得无限制使用权限

## 🔧 管理员配置

### 配置 API Key

1. 在 GitHub 仓库中添加环境变量：
   - 进入仓库设置 → Secrets and variables → Actions
   - 添加新的 repository secret：
     - Name: `VITE_GLM_API_KEY`
     - Value: 你的GLM API Key

2. 或者直接在 `.env` 文件中配置：
   ```env
   VITE_GLM_API_KEY=your_actual_glm_api_key_here
   ```

### 重新部署

当需要更新代码时：

```bash
cd project2

# 1. 提交更改
git add .
git commit -m "更新描述"

# 2. 推送到 GitHub
git push origin main

# 3. 自动部署到 GitHub Pages
# GitHub Actions 会自动触发部署
```

或者手动部署：

```bash
npm run deploy
```

## 📊 商业化使用

### 付费服务模式

1. **用户购买服务**
   - 用户支付费用
   - 提供网站链接和访问码

2. **免费试用**
   - 每个用户有3次免费使用机会
   - 让用户体验AI服务的价值

3. **持续使用**
   - 用户可选择购买更多服务
   - 或配置自己的API Key继续使用

### 优势

✅ **零成本部署**
- 使用 GitHub Pages 免费托管
- 无需服务器费用

✅ **易于管理**
- 统一的访问码控制
- 自动化的使用限制

✅ **灵活扩展**
- 支持自定义 API Key
- 用户可选择自己的付费方案

✅ **完整文档**
- 详细的用户指引
- 清晰的配置说明

## 🔐 安全性

### API Key 保护

- `.env` 文件已添加到 `.gitignore`
- 不会将 API Key 提交到公开仓库
- 建议使用 GitHub Actions Secrets 配置

### 访问控制

- 访问码 `francevisa2026` 只提供给付费用户
- 可根据需要更改访问码
- 在 `src/components/PasswordGate.tsx` 中修改

## 📈 监控和维护

### 查看 GitHub Pages 部署状态

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 查看最新的构建和部署状态

### 用户反馈收集

- 关注用户使用体验
- 收集功能改进建议
- 根据反馈优化服务

## 🎯 下一步优化建议

1. **添加更多 AI 功能**
   - 签证面试准备指南
   - 常见问题解答
   - 个性化行程建议

2. **增强用户体验**
   - 多语言支持
   - 暗色模式
   - 离线功能

3. **数据分析**
   - 用户使用统计
   - 热门功能分析
   - 性能监控

## 📞 技术支持

如遇技术问题：

1. 检查 GitHub Actions 部署日志
2. 查看浏览器控制台错误信息
3. 确认环境变量配置正确
4. 联系开发团队

---

**部署日期**: 2026年5月4日
**版本**: 优化版 v2.0
**状态**: ✅ 生产环境运行中
