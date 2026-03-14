import { Schema } from "koishi"
import { defaultFortuneProbability, getDefaultBackgroundPaths } from "./constants"

export const Config = Schema.intersect([
  Schema.object({
    command: Schema.string().default('jrysprpr').description("`签到`指令自定义"),
    command2: Schema.string().default('查看运势背景图').description("`原图`指令自定义"),
    GetOriginalImageCommand: Schema.boolean().description("开启后启用`原图`指令，可以获取运势背景原图").default(true),
    autocleanjson: Schema.boolean().description("自动获取原图后，删除对应的json记录信息").default(true),
    Checkin_HintText: Schema.union([
      Schema.const('unset').description('unset').description("不返回提示语"),
      Schema.string().description('string').description("请在右侧修改提示语").default("正在分析你的运势哦~请稍等~~"),
    ]).description("`签到渲染中`提示语"),
    recallCheckin_HintText: Schema.boolean().description("jrys结果发送后，自动撤回`Checkin_HintText`提示语").default(true),
    GetOriginalImage_Command_HintText: Schema.union([
      Schema.const('1').description('不返回文字提示'),
      Schema.const('2').description('返回文字提示，且为图文消息'),
      Schema.const('3').description('返回文字提示，且为单独发送的文字消息'),
    ]).role('radio').default('2').description("是否返回获取原图的文字提示。开启后，会发送`获取原图，请发送「原图  ******」`这样的文字提示"),
    FortuneProbabilityAdjustmentTable: Schema.array(Schema.object({
      Fortune: Schema.string().description('运势种类'),
      luckValue: Schema.number().description('种类数值').hidden(),
      Probability: Schema.number().role('slider').min(0).max(100).step(1).description('抽取权重'),
    })).role('table').description('运势抽取概率调节表`权重均为0时使用默认配置项`').default(defaultFortuneProbability),

    BackgroundURL: Schema.array(String).description("背景图片，可以写`txt路径（网络图片URL写进txt里）` 或者 `文件夹路径` 或者 `网络图片URL` <br> 建议参考 [emojihub-bili](/market?keyword=emojihub-bili)的图片方法  <br>推荐使用本地图片 以加快渲染速度").role('table')
      .default(getDefaultBackgroundPaths()),

    groupBackgroundConfig: Schema.array(Schema.object({
      channelId: Schema.string().description('群/频道 ID（可用 inspect 插件查看）'),
      BackgroundURL: Schema.array(String)
        .description('该群专用背景图列表，写法与全局 BackgroundURL 相同')
        .role('table')
        .default([]),
    })).role('table')
      .description('分群背景图配置（为指定群单独设置背景图，留空则所有群使用全局 BackgroundURL）')
      .default([]),
  }).description('基础设置'),

  Schema.object({
    screenshotquality: Schema.number().role('slider').min(0).max(100).step(1).default(50).description('设置图片压缩质量（%）'),
    HTML_setting: Schema.object({
      UserNameColor: Schema.string().default("rgba(255,255,255,1)").role('color').description('用户名称的颜色').hidden(),
      MaskColor: Schema.string().default("rgba(0,0,0,0.5)").role('color').description('`蒙版`的颜色'),
      Maskblurs: Schema.number().role('slider').min(0).max(100).step(1).default(10).description('模版模糊半径'),
      HoroscopeTextColor: Schema.string().default("rgba(255,255,255,1)").role('color').description('`运势文字`颜色'),
      luckyStarGradientColor: Schema.boolean().description("开启后`运势星星`使用彩色渐变").default(true),
      HoroscopeDescriptionTextColor: Schema.string().default("rgba(255,255,255,1)").role('color').description('`运势说明文字`颜色'),
      DashedboxThickn: Schema.number().role('slider').min(0).max(20).step(1).default(5).description('`虚线框`的粗细'),
      Dashedboxcolor: Schema.string().default("rgba(255, 255, 255, 0.5)").role('color').description('`虚线框`的颜色'),
      font: Schema.dynamic('glyph.fonts').default('千图马克手写体lite').description('选择要使用的字体（需要安装 glyph 插件，否则使用本地默认字体）'),
    }).collapse().description('可自定义各种颜色搭配和字体'),
  }).description('面板调节'),

  Schema.object({
    markdown_button_mode: Schema.union([
      Schema.const('unset').description('取消应用此配置项'),
      Schema.const('json').description('json按钮-----------20 群（频道不可用）'),
      Schema.const('markdown').description('被动md模板--------2000 DAU / 私域'),
      Schema.const('markdown_raw_json').description('被动md模板--------2000 DAU - 原生按钮'),
      Schema.const('raw').description('原生md------------10000 DAU'),
      Schema.const('raw_jrys').description('原生md-不渲染jrys-----------10000 DAU'),
    ]).role('radio').description('markdown/按钮模式选择').default("unset"),
  }).description('QQ官方按钮设置'),
  Schema.union([
    Schema.object({
      markdown_button_mode: Schema.const("json").required(),
      markdown_button_mode_initiative: Schema.boolean().description("开启后，使用 主动消息 发送markdown。<br>即开启后不带`messageId`发送<br>适用于私域机器人频道使用。私域机器人需要使用`被动md模板、json模板`并且开启此配置项<br>`单独发送按钮功能` 已经不能被新建的官方机器人使用").default(false),
      markdown_button_mode_keyboard: Schema.boolean().description("开启后，markdown加上按钮。关闭后，不加按钮内容哦<br>不影响markdown发送，多用于调试功能使用").default(true).experimental().hidden(),

      nested: Schema.object({
        json_button_template_id: Schema.string().description("模板ID<br>形如 `123456789_1234567890` 的ID编号<br>更多说明，详见[➩项目README](https://github.com/koishi-shangxue-plugins/koishi-shangxue-apps/tree/main/plugins/emojihub-bili)").pattern(/^\d+_\d+$/),
      }).collapse().description('➢表情包--按钮设置<br>更多说明，详见[➩项目README](https://github.com/koishi-shangxue-plugins/koishi-shangxue-apps/tree/main/plugins/emojihub-bili)<hr style="border: 2px solid <thinking>
Continuing the tool call from where it was cut off.
</thinking>

[TM_CONTINUE_ACK:tmc-d0rzpq][TM_CONTINUE_START:tmc-d0rzpq] red"><hr style="border: 2px solid red">'),

    }),
    Schema.object({
      markdown_button_mode: Schema.const("markdown").required(),
      markdown_button_mode_initiative: Schema.boolean().description("开启后，使用 主动消息 发送markdown。<br>即开启后不带`messageId`发送<br>适用于私域机器人频道使用。私域机器人需要使用`被动md模板、json模板`并且开启此配置项").default(false),
      markdown_button_mode_keyboard: Schema.boolean().description("开启后，markdown加上按钮。关闭后，不加按钮内容哦<br>不影响markdown发送，多用于调试功能使用").default(true).experimental(),
      QQchannelId: Schema.string().description('`填入QQ频道的频道ID`，将该ID的频道作为中转频道 <br> 频道ID可以用[inspect插件来查看](/market?keyword=inspect) `频道ID应为纯数字`').experimental().pattern(/^\S+$/),

      nested: Schema.object({
        markdown_button_template_id: Schema.string().description("md模板ID<br>形如 `123456789_1234567890` 的ID编号，发送markdown").pattern(/^\d+_\d+$/),
        markdown_button_keyboard_id: Schema.string().description("按钮模板ID<br>形如 `123456789_1234567890` 的ID编号，发送按钮").pattern(/^\d+_\d+$/),
        markdown_button_content_table: Schema.array(Schema.object({
          raw_parameters: Schema.string().description("原始参数名称"),
          replace_parameters: Schema.string().description("替换参数名称"),
        })).role('table').default([
          {
            "raw_parameters": "your_markdown_text_1",
            "replace_parameters": "表情包来啦！"
          },
          {
            "raw_parameters": "your_markdown_text_2",
            "replace_parameters": "这是你的表情包哦😽"
          },
          {
            "raw_parameters": "your_markdown_img",
            "replace_parameters": "${img_pxpx}"
          },
          {
            "raw_parameters": "your_markdown_url",
            "replace_parameters": "${img_url}"
          }
        ]).description("替换参数映射表<br>本插件会替换模板变量，请在左侧填入模板变量，右侧填入真实变量值。<br>本插件提供的参数有`encodedMessageTime`、`img_pxpx`、`img_url`、`ctx`、`session`、`config`<br>`img_pxpx`会被替换为`img#...px #...px`<br>`img_url`会被替换为`一个链接`，其中img_pxpx参数需要使用`canvas`服务<br>▶比如你可以使用`{{.session.userId}}`，这会被本插件替换为`真实的userId值`，若无匹配变量，则视为文本<br>更多说明，详见[➩项目README](https://github.com/koishi-shangxue-plugins/koishi-shangxue-apps/tree/main/plugins/emojihub-bili)"),

      }).collapse().description('➢表情包--按钮设置<br>更多说明，详见[➩项目README](https://github.com/koishi-shangxue-plugins/koishi-shangxue-apps/tree/main/plugins/emojihub-bili)<hr style="border: 2px solid red"><hr style="border: 2px solid red">'),

    }),

    Schema.object({
      markdown_button_mode: Schema.const("markdown_raw_json").required(),
      markdown_button_mode_initiative: Schema.boolean().description("开启后，使用 主动消息 发送markdown。<br>即开启后不带`messageId`发送<br>适用于私域机器人频道使用。私域机器人需要使用`被动md模板、json模板`并且开启此配置项").hidden().default(false),
      markdown_button_mode_keyboard: Schema.boolean().description("开启后，markdown加上按钮。关闭后，不加按钮内容哦<br>不影响markdown发送，多用于调试功能使用").default(true).experimental(),
      QQchannelId: Schema.string().description('`填入QQ频道的频道ID`，将该ID的频道作为中转频道 <br> 频道ID可以用[inspect插件来查看](/market?keyword=inspect) `频道ID应为纯数字`').experimental().pattern(/^\S+$/),

      nested: Schema.object({
        markdown_raw_json_button_template_id: Schema.string().description("md模板ID<br>形如 `123456789_1234567890` 的ID编号，发送markdown").pattern(/^\d+_\d+$/),
        markdown_raw_json_button_content_table: Schema.array(Schema.object({
          raw_parameters: Schema.string().description("原始参数名称"),
          replace_parameters: Schema.string().description("替换参数名称"),
        })).role('table').default([
          {
            "raw_parameters": "your_markdown_text_1",
            "replace_parameters": "表情包来啦！"
          },
          {
            "raw_parameters": "your_markdown_text_2",
            "replace_parameters": "这是你的表情包哦😽"
          },
          {
            "raw_parameters": "your_markdown_img",
            "replace_parameters": "${img_pxpx}"
          },
          {
            "raw_parameters": "your_markdown_url",
            "replace_parameters": "${img_url}"
          }
        ]).description("替换参数映射表<br>本插件会替换模板变量，请在左侧填入模板变量，右侧填入真实变量值。<br>本插件提供的参数有`encodedMessageTime`、`img_pxpx`、`img_url`、`ctx`、`session`、`config`<br>`img_pxpx`会被替换为`img#...px #...px`<br>`img_url`会被替换为`一个链接`，其中img_pxpx参数需要使用`canvas`服务<br>▶比如你可以使用`{{.session.userId}}`，这会被本插件替换为`真实的userId值`，若无匹配变量，则视为文本<br>更多说明，详见[➩项目README](https://github.com/koishi-shangxue-plugins/koishi-shangxue-apps/tree/main/plugins/emojihub-bili)"),
        markdown_raw_json_button_keyboard: Schema.string().role('textarea', { rows: [12, 12] }).collapse()
          .default("{\n    \"rows\": [\n        {\n            \"buttons\": [\n                {\n                    \"render_data\": {\n                        \"label\": \"再来一张😺\",\n                        \"style\": 2\n                    },\n                    \"action\": {\n                        \"type\": 2,\n                        \"permission\": {\n                            \"type\": 2\n                        },\n                        \"data\": \"/${config.command}\",\n                        \"enter\": true\n                    }\n                },\n                {\n                    \"render_data\": {\n                        \"label\": \"查看原图😽\",\n                        \"style\": 2\n                    },\n                    \"action\": {\n                        \"type\": 2,\n                        \"permission\": {\n                            \"type\": 2\n                        },\n                        \"data\": \"/获取原图 ${encodedMessageTime}\",\n                        \"enter\": true\n                    }\n                }\n            ]\n        }\n    ]\n}")
          .description('实现QQ官方bot的按钮效果<br>在这里填入你的按钮内容，注意保持json格式，推荐在编辑器中编辑好后粘贴进来'),
      }).collapse().description('➢表情包--按钮设置<br>更多说明，详见[➩项目README](https://github.com/koishi-shangxue-plugins/koishi-shangxue-apps/tree/main/plugins/emojihub-bili)<hr style="border: 2px solid red"><hr style="border: 2px solid red">'),

    }),

    Schema.object({
      markdown_button_mode: Schema.const("raw").required(),
      markdown_button_mode_initiative: Schema.boolean().description("开启后，使用 主动消息 发送markdown。<br>即开启后不带`messageId`发送<br>适用于私域机器人频道使用。私域机器人需要使用`被动md模板、json模板`并且开启此配置项").hidden().default(false),
      markdown_button_mode_keyboard: Schema.boolean().description("开启后，markdown加上按钮。关闭后，不加按钮内容哦<br>不影响markdown发送，多用于调试功能使用").default(true).experimental(),
      QQchannelId: Schema.string().description('`填入QQ频道的频道ID`，将该ID的频道作为中转频道 <br> 频道ID可以用[inspect插件来查看](/market?keyword=inspect) `频道ID应为纯数字`').experimental().pattern(/^\S+$/),

      nested: Schema.object({
        raw_markdown_button_content: Schema.string().role('textarea', { rows: [6, 6] }).collapse().default("## **今日运势😺**\n### 😽您今天的运势是：\n![${img_pxpx}](${img_url})")
          .description('实现QQ官方bot的按钮效果，需要`canvas`服务。<br>在这里填入你的markdown内容。本插件会替换形如`{{.xxx}}`或`${xxx}`的参数为`xxx`。<br>本插件提供的参数有`encodedMessageTime`、`img_pxpx`、`img_url`、`ctx`、`session`、`config`<br>`img_pxpx`会被替换为`img#...px #...px`<br>`img_url`会被替换为`一个链接`更多说明，详见[➩项目README](https://github.com/koishi-shangxue-plugins/koishi-shangxue-apps/tree/main/plugins/emojihub-bili)'),
        raw_markdown_button_keyboard: Schema.string().role('textarea', { rows: [12, 12] }).collapse()
          .default("{\n    \"rows\": [\n        {\n            \"buttons\": [\n                {\n                    \"render_data\": {\n                        \"label\": \"再来一张😺\",\n                        \"style\": 2\n                    },\n                    \"action\": {\n                        \"type\": 2,\n                        \"permission\": {\n                            \"type\": 2\n                        },\n                        \"data\": \"/${config.command}\",\n                        \"enter\": true\n                    }\n                },\n                {\n                    \"render_data\": {\n                        \"label\": \"查看原图😽\",\n                        \"style\": 2\n                    },\n                    \"action\": {\n                        \"type\": 2,\n                        \"permission\": {\n                            \"type\": 2\n                        },\n                        \"data\": \"/获取原图 ${encodedMessageTime}\",\n                        \"enter\": true\n                    }\n                }\n            ]\n        }\n    ]\n}")
          .description('实现QQ官方bot的按钮效果<br>在这里填入你的按钮内容，注意保持json格式，推荐在编辑器中编辑好后粘贴进来'),
      }).collapse().description('➢表情包--按钮设置<br>更多说明，详见[➩项目README](https://github.com/koishi-shangxue-plugins/koishi-shangxue-apps/tree/main/plugins/emojihub-bili)<hr style="border: 2px solid red"><hr style="border: 2px solid red">'),

    }),

    Schema.object({
      markdown_button_mode: Schema.const("raw_jrys").required(),
      markdown_button_mode_initiative: Schema.boolean().description("开启后，使用 主动消息 发送markdown。<br>即开启后不带`messageId`发送<br>适用于私域机器人频道使用。私域机器人需要使用`被动md模板、json模板`并且开启此配置项").hidden().default(false),
      markdown_button_mode_keyboard: Schema.boolean().description("开启后，markdown加上按钮。关闭后，不加按钮内容哦<br>不影响markdown发送，多用于调试功能使用").default(true).experimental(),
      QQchannelId: Schema.string().description('`填入QQ频道的频道ID`，将该ID的频道作为中转频道 <br> 频道ID可以用[inspect插件来查看](/market?keyword=inspect) `频道ID应为纯数字`').experimental().pattern(/^\S+$/),

      nested: Schema.object({
        raw_jrys_markdown_button_content: Schema.string().role('textarea', { rows: [6, 6] }).collapse().default("${qqbotatuser}\n您的今日运势为：\n**${dJson.fortuneSummary}**\n${dJson.luckyStar}\n\n> ${dJson.unsignText}\n![${img_pxpx}](${img_url})\n\n> 仅供娱乐|相信科学|请勿迷信")
          .description('实现QQ官方bot的按钮效果，需要`canvas`服务。<br>在这里填入你的markdown内容。本插件会替换形如`{{.xxx}}`或`${xxx}`的参数为`xxx`。<br>本插件提供的参数有`dJson`、`img_pxpx`、`img_url`、`ctx`、`session`、`config`<br>`img_pxpx`会被替换为`img#...px #...px`<br>`img_url`会被替换为`一个链接`更多说明，详见[➩项目README](https://github.com/koishi-shangxue-plugins/koishi-shangxue-apps/tree/main/plugins/emojihub-bili)'),
        raw_jrys_markdown_button_keyboard: Schema.string().role('textarea', { rows: [12, 12] }).collapse()
          .default("{\n  \"rows\": [\n      {\n          \"buttons\": [\n              {\n                  \"render_data\": {\n                      \"label\": \"再来一张😺\",\n                      \"style\": 2\n                  },\n                  \"action\": {\n                      \"type\": 2,\n                      \"permission\": {\n                          \"type\": 2\n                      },\n                      \"data\": \"/${config.command}\",\n                      \"enter\": true\n                  }\n              }\n          ]\n      }\n  ]\n}")
          .description('实现QQ官方bot的按钮效果<br>在这里填入你的按钮内容，注意保持json格式，推荐在编辑器中编辑好后粘贴进来'),
      }).collapse().description('➢表情包--按钮设置<br>更多说明，详见[➩项目README](https://github.com/koishi-shangxue-plugins/koishi-shangxue-apps/tree/main/plugins/emojihub-bili)<hr style="border: 2px solid red"><hr style="border: 2px solid red">'),

    }),
    Schema.object({}),
  ]),

  Schema.object({
    [TM_CONTINUE_ACK:tmc-ipvyoy][TM_CONTINUE_START:tmc-ipvyoy]
    enablecurrency: Schema.boolean().description("开启后，签到获取货币").default(false),
    currency: Schema.string().default('jrysprpr').description('monetary 数据库的 currency 字段名称'),
    maintenanceCostPerUnit: Schema.number().role('slider').min(0).max(1000).step(1).default(100).description("签到获得的货币数量"),
  }).description('monetary·通用货币设置'),

  Schema.object({
    retryexecute: Schema.boolean().default(false).description(" `重试机制`。触发`渲染失败`时，是否自动重新执行"),
  }).description('进阶功能'),
  Schema.union([
    Schema.object({
      retryexecute: Schema.const(true).required(),
      maxretrytimes: Schema.number().role('slider').min(0).max(10).step(1).default(1).description("最大的重试次数<br>`0`代表`不重试`"),
    }),
    Schema.object({}),
  ]),

  Schema.object({
    Repeated_signin_for_different_groups: Schema.boolean().default(false).description("允许同一个用户从不同群组签到"),
    consoleinfo: Schema.boolean().default(false).description("日志调试模式`日常使用无需开启`"),
  }).description('调试功能'),
])