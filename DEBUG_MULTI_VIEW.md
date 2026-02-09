# 多视角诊断功能 - 调试指南

## 问题：点击"查看多视角诊断"没有反应

### 可能原因

1. **AI 没有返回 multiViewDiagnosis 数据**
   - Prompt A 的输出格式可能不包含多视角数据
   - AI 模型可能没有按照新格式返回

2. **按钮没有正确绑定事件**
   - onClick 事件没有触发
   - setStep 函数没有执行

3. **条件判断问题**
   - `result.multiViewDiagnosis` 为 undefined
   - 入口按钮没有显示

## 调试步骤

### 第一步：检查是否有多视角数据

1. 打开浏览器（Chrome/Edge）
2. 按 F12 打开开发者工具
3. 切换到 Console 标签
4. 完成一次诊断
5. 查看控制台输出：

```
🔍 诊断结果: { clarityPhase: "...", ... }
📊 是否有多视角数据: true/false
```

**如果显示 `false`**：
- 说明 AI 没有返回多视角数据
- 开发模式会自动添加 Mock 数据
- 刷新页面重新诊断

**如果显示 `true`**：
- 说明数据正常
- 继续下一步调试

### 第二步：检查入口按钮是否显示

1. 在诊断结果页面
2. 向下滚动到底部
3. 查找蓝色卡片："想从更多角度看这份诊断？"

**如果没有看到**：
- 打开控制台，执行：
```javascript
// 检查 result 对象
console.log('Result:', window.result);
```

**如果看到了**：
- 继续下一步

### 第三步：检查按钮点击事件

1. 在控制台执行：
```javascript
// 手动触发页面切换
// 注意：这需要在 React 组件内部执行，外部无法直接访问
```

2. 或者在 App.tsx 中添加调试日志：
```typescript
<Button 
  onClick={() => {
    console.log('🖱️ 点击了查看多视角诊断按钮');
    console.log('📊 当前 result:', result);
    console.log('📊 multiViewDiagnosis:', result?.multiViewDiagnosis);
    setStep(AppStep.MULTI_VIEW);
  }} 
  variant="outline"
  className="w-full py-3 text-base font-bold border-2 border-blue-400 text-blue-600 hover:bg-blue-50"
>
  查看多视角诊断
</Button>
```

### 第四步：使用 Mock 数据测试

我已经添加了 Mock 数据功能，在开发模式下会自动使用。

**验证 Mock 数据是否生效**：

1. 刷新页面
2. 完成诊断
3. 查看控制台是否有：
```
🔧 开发模式：添加 Mock 多视角数据
```

4. 如果有，说明 Mock 数据已添加
5. 应该能看到"查看多视角诊断"按钮

### 第五步：手动添加多视角数据

如果以上都不行，可以手动添加：

1. 打开浏览器控制台
2. 完成诊断后，在控制台执行：

```javascript
// 注意：这只是临时测试，刷新后会失效
// 实际需要修改代码
```

## 快速修复方案

### 方案 1：强制使用 Mock 数据（推荐）

我已经实现了这个方案。现在：

1. **刷新页面**（Ctrl+R 或 Cmd+R）
2. **重新完成诊断**
3. **查看控制台**，应该看到：
   ```
   🔧 开发模式：添加 Mock 多视角数据
   📊 是否有多视角数据: true
   ```
4. **向下滚动**，应该能看到蓝色的"查看多视角诊断"卡片
5. **点击按钮**，应该能进入多视角页面

### 方案 2：检查 Vite 环境变量

确认是否在开发模式：

1. 打开控制台
2. 执行：
```javascript
console.log('DEV mode:', import.meta.env.DEV);
```

应该显示 `true`

### 方案 3：清除缓存重试

1. 打开控制台
2. 执行：
```javascript
localStorage.clear();
location.reload();
```

3. 重新完成诊断

## 常见错误信息

### 错误 1：Cannot read property 'multiViewDiagnosis' of null

**原因**：result 为 null

**解决**：
- 确保诊断成功完成
- 检查 API 是否正常返回数据

### 错误 2：setStep is not a function

**原因**：setStep 函数未定义

**解决**：
- 检查 App.tsx 中的 useState 定义
- 确保在正确的组件作用域内

### 错误 3：AppStep.MULTI_VIEW is undefined

**原因**：types.ts 中没有定义 MULTI_VIEW

**解决**：
- 检查 types.ts 是否包含：
```typescript
export enum AppStep {
  MULTI_VIEW = 'MULTI_VIEW'
}
```

## 验证清单

完成以下检查：

- [ ] 浏览器控制台没有红色错误
- [ ] 诊断成功完成，显示结果页面
- [ ] 控制台显示：`📊 是否有多视角数据: true`
- [ ] 结果页面底部有蓝色卡片
- [ ] 卡片标题："想从更多角度看这份诊断？"
- [ ] 卡片内有"查看多视角诊断"按钮
- [ ] 点击按钮后控制台有日志输出
- [ ] 页面切换到多视角诊断页面

## 如果还是不行

### 最后的调试方法

在 App.tsx 的 renderResult 函数中，临时添加强制显示：

```typescript
// 临时调试：强制显示多视角入口
<div className="space-y-4 pt-6 border-t border-slate-100">
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 space-y-4">
    <p className="text-sm text-red-600">
      调试信息：
      <br/>result 存在: {result ? '✅' : '❌'}
      <br/>multiViewDiagnosis 存在: {result?.multiViewDiagnosis ? '✅' : '❌'}
    </p>
    <Button 
      onClick={() => {
        console.log('🖱️ 按钮被点击');
        console.log('📊 result:', result);
        alert('按钮点击成功！即将跳转...');
        setStep(AppStep.MULTI_VIEW);
      }} 
      className="w-full py-3 text-base font-bold"
    >
      测试：查看多视角诊断
    </Button>
  </div>
</div>
```

这样可以：
1. 看到 result 和 multiViewDiagnosis 的状态
2. 测试按钮点击是否有效
3. 确认页面跳转是否正常

## 联系支持

如果以上方法都不行，请提供：

1. 浏览器控制台的完整截图
2. 诊断结果页面的截图
3. 控制台中的错误信息（如果有）
4. 执行 `console.log(result)` 的输出

---

**当前状态**：
- ✅ Mock 数据已添加
- ✅ 开发模式自动启用
- ✅ 调试日志已添加

**下一步**：
1. 刷新页面
2. 重新完成诊断
3. 查看控制台输出
4. 查找蓝色卡片
5. 点击按钮测试
