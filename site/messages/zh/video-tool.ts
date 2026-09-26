import { videoTemplatesZh } from '../video-templates-zh';

export default {
    title: '从一条片子开始', description: '预览这次请求。目前不会生成，也不会扣积分。',
    media: { video: '视频', image: '图片' },
    workflows: { 'multi-reference': '多参考', 'text-video': '文生视频', 'image-video': '图生视频', 'text-image': '文生图片', 'image-edit': '图生图片', 'multi-image': '图层拆解' },
    vendors: { minimax: 'MiniMax', seedance: 'Seedance', wan: 'Wan', grok: 'Grok', kling: 'Kling', seedream: 'Seedream', openai: 'GPT Image', 'nano-banana': 'Nano Banana' },
    modelSubtitles: { 'seedream-5-pro': '创作更自由', 'seedream-5-lite': '创作更自由' }, galleryHeadings: { image: '热门模板' },
    models: {
      'minimax-h3-max': 'MiniMax H3 Max', 'minimax-h3': 'MiniMax H3', 'minimax-h3-lite': 'MiniMax H3 Lite',
      'seedance-2-5': 'Seedance 2.5', 'seedance-2-0': 'Seedance 2.0', 'seedance-2-0-fast': 'Seedance 2.0 Fast', 'seedance-2-0-mini': 'Seedance 2.0 Mini', 'seedance-1-5-pro': 'Seedance 1.5 Pro',
      'wan-3-0': 'Wan 3.0', 'wan-2-7': 'Wan 2.7', 'wan-2-6': 'Wan 2.6', 'grok-imagine': 'Grok Imagine', 'kling-3-0': 'Kling 3.0',
      'seedream-5-pro': 'Seedream 5.0 Pro', 'seedream-5-lite': 'Seedream 5 Lite', 'seedream-4-5': 'Seedream 4.5',
      'gpt-image-2-5': 'GPT Image 2.5', 'gpt-image-2': 'GPT Image 2',
      'nano-banana-2': 'Nano Banana 2', 'nano-banana-pro': 'Nano Banana Pro', 'nano-banana': 'Nano Banana',
    },
    tags: { max: '旗舰', fast: '极速', pro: '专业', free: '每日免费', quality: '最佳质量' },
    fields: { ratio: '画面比例', resolution: '分辨率', duration: '时长', generateAudio: '生成音频', seed: '随机种子', size: '尺寸', format: '输出格式' },
    switchStates: { on: '开启', off: '关闭' },
    options: {
      ratio: { 'auto': '自动', 'adaptive': '自适应', '21-9': '21:9', '16-9': '16:9', '9-16': '9:16', '1-1': '1:1', '3-4': '3:4', '4-3': '4:3' },
      resolution: { '720p': '720P', '1080p': '1080P', '2k': '2K' },
      size: { '1k': '1K', '2k': '2K', '4k': '4K' },
      format: { jpeg: 'JPEG', png: 'PNG' },
    },
    references: {
      title: '参考素材', titleByWorkflow: { 'image-video': '图片', 'image-edit': '输入图片', 'multi-image': '输入图片' }, uploadHint: '点击或拖拽上传图片、视频或音频', uploadHintByMedia: { image: '点击或拖拽上传参考图片' }, hintsByWorkflow: { 'image-video': '添加首帧或尾帧', 'image-edit': '点击上传（最多 16 张）', 'multi-image': '点击上传（最多 1 张）' }, startFrame: '首帧', endFrame: '尾帧', library: '使用素材库', closeLibrary: '关闭素材库',
      limits: { image: '图片', video: '视频', audio: '音频' },
      candidates: { 'lattice-pie-photo': '格子派', 'fruit-tarts-photo': '水果塔', 'seeded-loaf-photo': '杂粮面包', 'layer-cake-photo': '夹层蛋糕', 'kitchen-video': '厨房视频', 'kitchen-audio': '厨房音轨' },
    },
    prompt: { title: '提示词', titleByWorkflow: { 'multi-image': '拆解说明（可选）' }, placeholder: '描述你想要的画面。用 @1、@2 引用已上传的素材', placeholderByMedia: { image: '描述你想生成的图片...' }, placeholderByWorkflow: { 'multi-image': '留空则自动拆解，也可以指定要分离的元素...' }, maxLength: 7000, maxLengthByMedia: { image: 20000 }, assist: '用 AI 生成', suggestion: '第一人称厨房烘焙，轻微广角，画面里只有手和前臂。' },
    model: '模型', workflowLabel: '工作流', parameters: '参数', expand: '展开参数', collapse: '收起参数', quantity: '数量', quantityPrefix: 'x', create: '创建',
    promo: '年付方案：只要 30 积分，立省 30% →', promoDismiss: '关闭年付优惠',
    tabs: {
      'use-cases': { label: '用例', empty: '暂无用例。', labelByMedia: { image: '模板' } },
      history: { label: '历史', empty: '还没有生成记录。' },
      break: { label: '休息一下 🌴', empty: '休息一会儿。用例还在旁边的页签里。' },
    },
    assets: {
      ...videoTemplatesZh,
      'lattice-pie': { title: '格子派', description: '第一人称厨房烘焙，轻微广角，手持沉浸。全程不露脸，只有手和前臂。@ 图片 1', actions: { reference: '参考生成', edit: '视频编辑' }, links: { cases: '探索更多用例 →', prompts: '探索 6000+ 提示词 →' } },
      'fruit-tarts': { title: '水果塔', description: '柔光下俯拍一盘水果塔。不露脸。@ 图片 1', actions: { reference: '参考生成', edit: '视频编辑' }, links: { cases: '探索更多用例 →', prompts: '探索 6000+ 提示词 →' } },
      'seeded-loaf': { title: '杂粮面包', description: '贴近深色案板上沾着面粉的面包，手持缓移。@ 图片 1', actions: { reference: '参考生成', edit: '视频编辑' }, links: { cases: '探索更多用例 →', prompts: '探索 6000+ 提示词 →' } },
    },
    status: { idle: '当前为预览模式，不会生成内容或扣除积分。', running: '正在生成', done: '生成完成', failed: '生成失败' }, previewHeading: '请求预览',
  };
