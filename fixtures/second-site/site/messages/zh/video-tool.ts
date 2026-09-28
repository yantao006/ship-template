export default {
  title: '制作片段', description: '预览请求内容，不会实际生成或扣费。',
  media: { video: '视频', image: '图片' },
  workflows: { multi: '多素材参考', 'text-video': '文生视频', 'image-video': '图生视频', 'text-image': '文生图' },
  vendors: { 'clip-lab': '片段实验室', 'still-lab': '图像实验室' },
  models: { 'bench-clip': '片段模型', 'bench-still': '图像模型' },
  tags: { short: '短片' }, fields: { ratio: '画幅比例', duration: '时长' },
  options: { ratio: { wide: '宽屏', square: '方形' } }, switchStates: { on: '开启', off: '关闭' },
  references: {
    title: '参考素材', titleByWorkflow: { 'image-video': '图片' }, uploadHint: '点击或拖拽上传图片',
    hintsByWorkflow: { 'image-video': '添加首帧或尾帧' }, startFrame: '首帧', endFrame: '尾帧',
    library: '使用素材库', closeLibrary: '关闭素材库', limits: { image: '图片' }, candidates: { loaf: '面包' },
  },
  prompt: { title: '提示词', placeholder: '描述你想创作的内容', placeholderByMedia: { image: '描述你想生成的图片...' }, assist: '用 AI 生成', suggestion: '桌上的一条面包。' },
  model: '模型', workflowLabel: '工作流', parameters: '参数', expand: '展开参数', collapse: '收起参数', quantity: '数量', quantityPrefix: 'x', create: '创建',
  tabs: { 'use-cases': { label: '案例', empty: '暂无案例。' }, history: { label: '历史', empty: '暂无生成记录。' } },
  assets: {
    'loaf-case': { title: '面包片段', description: '桌上的一条面包。', actions: { open: '打开' }, links: { more: '更多案例' } },
    'still-case': { title: '面包图片', description: '桌上的一条面包。', actions: { open: '打开' }, links: { more: '更多案例' } },
  },
  status: { idle: '预览模式，不会实际生成或扣费。', running: '生成中', done: '生成完成', failed: '生成失败' }, previewHeading: '请求预览',
};
