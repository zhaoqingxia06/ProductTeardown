// Each product supplies its own scenarios and optional diagram layout.
window.productMechanisms = {
 powerbank: { scenarios: [
  {id:'input',label:'充电过程',start:'插入充电器',layout:'powerbankInput'},
  {id:'wired',label:'有线放电',start:'接入设备'},
  {id:'wireless',label:'无线放电',start:'靠近接收端'}
 ], diagrams: {powerbankInput: { svg: `<svg viewBox="0 0 720 1030" aria-hidden="true"><defs><marker id="flowArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="none" stroke="#9aa1ab" stroke-width="1"/></marker></defs><g fill="none" stroke="#a5acb6" stroke-width="1.4" marker-end="url(#flowArrow)"><path d="M558 70 V112"/><path d="M558 176 V220"/><path d="M530 282 V300 H325 Q315 300 315 310 V350"/><path d="M590 282 V350"/><path d="M315 416 V430 Q315 440 325 440 H510 Q520 440 520 450 V462"/><path d="M590 416 V462"/><path d="M555 530 V568"/><path d="M520 634 V652 H315 Q305 652 305 662 V710"/><path d="M590 634 V710"/><path d="M590 770 V858"/><path d="M495 890 H205 Q195 890 195 880 V816"/><path d="M105 806 V858"/><path d="M155 806 V820 Q155 830 165 830 H485 Q495 830 495 858"/></g></svg>`, nodes: [] }} }
};
{const node=(html,x,y,w,h,cls='',index=null)=>window.productMechanisms.powerbank.diagrams.powerbankInput.nodes.push({html,x,y,w,h,cls,steps:index===null?[]:Array.isArray(index)?index:[index]});
  node('插入充电器<br>交流电转换为直流电',455,5,205,65);
  node('USB-C 接口检测接入<br>建立基础供电',455,112,205,64,'',0);
  node('是否支持共同的<br>快充协议？',470,220,180,62,'decision');
  node('支持',280,310,70,30,'pill');node('不支持',554,310,72,30,'pill');
  node('协议协商<br>确定双方支持的电压和电流',205,350,220,66,'',1);
  node('使用兼容的基础供电<br>通常为 5 V',480,350,220,66);
  node('输入保护<br>检查输入电压、电流等',455,462,205,68,'',2);
  node('电池状态是否允许充电？<br>检查电压、温度等',440,568,230,66,'decision',[3,4]);
  node('不允许',270,670,75,30,'pill');node('允许',555,670,70,30,'pill');
  node('暂停充电或进入保护',205,710,200,60,'stop');
  node('充电管理电路调节电压、电流',465,710,235,60,'',5);
  node('电池充电<br>预充 → 恒流 → 恒压',470,858,230,64,'',5);
  node('达到充电终止条件？',35,740,210,66,'decision',6);
  node('是',78,815,52,28,'pill');node('否',150,815,52,28,'pill');
  node('停止充电<br>持续监测电池状态',15,858,180,64,'stop');
}

window.productMechanisms.powerbank.flows = {
 input:[
 {title:'连接电源',text:'充电器将交流电转成直流电；接入 USB-C 后识别连接。接口默认 5 V，接口本身不改变电压。',focus:'socket',reading:'连接正常 · 默认 5 V'},
 {title:'识别与协议协商',text:'协议通信与电能路径分开。双方支持时协商共同档位，本演示从 5 V 协商至 9 V；否则可采用支持的默认供电。',focus:'poweric',reading:'通信完成 · 9 V（示例）'},
 {title:'输入保护与转换',text:'输入保护检查异常，转换电路调节输入电压。保护和转换可与其他检测并行，功能位置与线路为示意。',focus:'inductor',reading:'9 V 输入 · 转换电路（示例）'},
 {title:'检测电池状态',text:'检测电池电压、温度及保护状态；电量估算是辅助信息，不能代替安全检测。',focus:'pouch',reading:'电压 / 温度检测 · 正常'},
 {title:'判断充电条件',text:'输入与电池条件正常时允许充电；异常时暂停或禁止。具体保护阈值取决于电芯和电路设计。',focus:'protectic',reading:'条件满足 → 继续'},
 {title:'执行充电',text:'电能经充电管理电路进入电池。电压较低时可能预充；恒流阶段电压上升，随后恒压阶段电流逐渐下降。',focus:'pouch',reading:'恒流 → 恒压 · 示意'},
 {title:'充电结束',text:'达到终止条件后停止充电，并保留完整路径；异常保护是额外安全防护。',focus:'poweric',reading:'满足终止条件 → 停止'}
 ],
 wired:[
 {title:'手机连接',text:'通过 USB-C 线连接手机，检测连接与供电角色。',focus:'socket',reading:'连接正常 · 准备供电'},
 {title:'输出能力协商',text:'双方交换支持的供电能力；支持时选择共同档位，本例使用 9 V，未协商时按支持的默认供电处理。',focus:'poweric',reading:'协商成功 · 9 V（示例）'},
 {title:'检查放电条件',text:'检测电池电压、温度和保护状态，本次演示条件正常；异常时限制或停止输出。',focus:'protectic',reading:'状态正常 → 允许输出'},
 {title:'电池输出与转换',text:'电池释放直流电，经保护和 DC-DC 转换，调节到适合设备的输出电压。',focus:'inductor',reading:'电池侧直流 → 输出侧电压'},
 {title:'接口输出至手机',text:'电能经 USB-C 和线缆到手机；电流由负载需求和设备允许范围共同决定。',focus:'socket',reading:'USB-C 输出 · 9 V（示例）'},
 {title:'持续监测与停止',text:'持续检查状态；低电量、异常或拔出时停止或限制输出，完整路径保留片刻。',focus:'protectic',reading:'停止条件触发 · 停止输出'}
 ],
 wireless:[
 {title:'接收端检测与通信',text:'无线主控检测接收端并交换识别和功率信息；磁体辅助对位。',focus:'wirelessic',part:'无线充电主控',routes:[],reading:'检测接收端 · 协商功率'},
 {title:'供电条件判断',text:'接收端兼容、通信正常，且电芯状态、温度及异物检测满足要求时允许输出。',focus:'wirelessic',part:'无线充电主控',routes:[],reading:'条件满足 → 允许无线输出'},
 {title:'电芯放电与电压转换',text:'电芯释放直流电；转换电路将其调节到无线发射级所需的电压。',focus:'inductor',part:'DC-DC 功率转换',routes:[2],reverse:[2],reading:'电芯约 3.6–4.2 V → 发射级直流',note:'发射级电压随方案和负载变化'},
 {title:'驱动发射线圈',text:'无线功率级将直流转换为高频交流，驱动发射线圈产生交变磁场。',focus:'wirelessic',part:'无线充电主控',routes:[2,3],reverse:[2],reading:'直流 → 高频交流'},
 {title:'无线能量传递',text:'发射线圈通过交变磁场向外传递能量；接收端反馈状态，发射端据此调整或停止。',focus:'coil',routes:[3,5],reading:'交变磁场 · 能量向外传递',note:'无线能量及路径为示意，非实测磁场分布'},
 {title:'停止输出',text:'接收端移开、通信中断、异物或温度异常时，发射端降低功率或停止输出。',focus:'coil',routes:[],reading:'移开或异常 → 停止输出'}
 ]};

// One continuous user journey: charge the bank, then use its stored energy.
window.productMechanisms.powerbank.flows.journey = [
 ...window.productMechanisms.powerbank.flows.input,
 {title:'连接手机',text:'充电完成后移除充电器，使用 USB-C 线连接手机。电池中储存的能量成为接下来供电的来源。',focus:'socket',reading:'切换连接 · 电池保持储能'},
 ...window.productMechanisms.powerbank.flows.wired.slice(1)
];
window.productMechanisms.powerbank.scenarios = [
 {id:'journey',label:'完整使用流程',start:'接入充电器'},
 {id:'wireless',label:'无线充电',start:'靠近接收端'}
];

// Each narrated step identifies the functional part shown in the model.
const journey=window.productMechanisms.powerbank.flows.journey;
const revised=[
 ['外部电源与 USB-C 接口','接入充电器；充电器将交流电转换为直流电，USB-C 接口负责连接和传输，接口本身不改变电压。'],
 ['协议控制功能','通过 USB-C 相关信号识别供电能力；双方支持时协商档位，否则使用兼容的基础供电。'],
 ['输入保护与 DC-DC 转换','输入保护检查异常；功率转换电路将输入调节至适合充电管理的条件。具体功能可能集成在同一芯片内。'],
 ['电池状态检测','管理电路检测电池电压、温度和保护状态，判断电池能否安全充电。'],
 ['电池保护与充电管理','输入和电池条件正常时允许充电；异常时限制或暂停，恢复后重新判断。'],
 ['电池包充电','充电管理调节电压、电流；可能先预充，再恒流、恒压，电池将电能储存为化学能。'],
 ['充电管理终止充电','满足电芯和电路设定的终止条件后停止充电，并持续监测状态。'],
 ['USB-C 接口连接设备','充电完成后连接受电设备，接口识别连接与供电角色。'],
 ['协议控制功能协商输出','交换双方支持的供电能力，协商共同档位；无法协商时使用支持的基础输出。'],
 ['电池保护电路检查','检测电池电压、温度和保护状态；正常时允许输出，异常时限制或停止。'],
 ['电池包与 DC-DC 转换','电池释放电能，经保护和 DC-DC 电路转换为适合输出的直流电压。'],
 ['USB-C 接口输出','电能经 USB-C 接口输出到受电设备，电流受设备需求和供电能力限制。'],
 ['保护电路持续监测','持续监测电池和输出状态，低电量、异常或设备断开时限制或停止输出。']
];
revised.forEach((entry,i)=>{journey[i]={...journey[i],title:entry[0],text:entry[1]}});

// A single continuous journey with one model label for each flow node.
window.productMechanisms.powerbank.flows.journey = [
 {title:'接入外部电源',text:'充电器将交流电转换为直流电，通过充电线传输至充电宝的 USB-C 接口。',focus:'socket',label:'USB-C：外部电源接入'},
 {title:'识别连接与供电能力',text:'充电线接入后，USB-C 接口通过信号引脚识别连接及供电角色，并将供电能力信息交给控制电路。',focus:'socket',label:'USB-C：直流电输入'},
 {title:'协商输入电压和电流',text:'协议控制电路与充电器交换供电能力；双方支持相同快充协议时协商合适的电压和电流，否则使用兼容的基础供电。',focus:'socket',label:'协议通信：协商输入'},
 {title:'检查并保护输入电路',text:'输入保护电路监测输入电压等状态；发生过压等异常时，限制或切断输入，保护后级电路。',focus:'poweric',label:'输入保护：检查输入'},
 {title:'检测电池状态',text:'接入电源后，充电管理电路检测电芯电压及温度（配有传感器时）；保护芯片监测电芯状态，异常时控制保护开关。',focus:'batteryDetection',label:'充电管理：检测电池'},
 {title:'判断是否允许充电',text:'输入、电芯电压及温度正常时充电；异常时限流或暂停。',focus:'poweric',label:'充电管理：判断条件'},
 {title:'调节充电电压和电流',text:'充电管理芯片控制开关管，配合电感和电容调节电压、电流，适配电池充电。',focus:'conversionStage',label:'开关管与电感：转换电能'},
 {title:'保护电池充电回路',text:'充电时，保护芯片监测电芯状态，保护开关保持导通，主充电电流流经开关。检测到异常时，保护芯片可控制开关断开。',focus:'protectionStage',label:'电池保护：异常时断开'},
 {title:'电池储存电能',text:'电能通过电池保护回路进入电池，转化为化学能储存。',focus:'pouch',label:'电池包：储存能量'},
 {title:'控制充电并在充满后停止',text:'充电管理芯片持续调节：先恒流、再恒压；满足终止条件后结束充电。动画压缩了这一过程的时间。',focus:'pouch',label:'充电调节与终止'},
 {title:'接收端识别与通信',text:'手机靠近后，无线主控通过线圈检测接收端，并与其交换充电信息。',focus:'wirelessic',label:'信号：识别与通信'},
 {title:'检测与放电判断',text:'电池状态正常时放电；异常时限流或停止。',focus:'protectic',label:'信号：判断放电条件'},
 {title:'电池放电与电压转换',text:'条件满足后，电芯释放电能；功率开关与电感配合调节输出电压。',focus:'pouch',label:'电池与功率转换电路'},
 {title:'驱动发射线圈',text:'将直流电转换为高频交变电流，驱动发射线圈。',focus:'wirelessic',label:'无线充电驱动：转换电流'},
 {title:'发射线圈传递能量',text:'产生交变磁场，向接收端传递能量。',focus:'coil',label:'发射线圈：产生交变磁场'},
 {title:'接收线圈接收能量',text:'将磁场能量转换为电能，为受电设备充电。',focus:'coil',label:'接收线圈：接收能量'}
];
window.productMechanisms.powerbank.scenarios=[{id:'journey',label:'完整使用流程',start:'充电器接入'}];
