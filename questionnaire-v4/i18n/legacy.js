const LEGACY={
  "maps": {
    "family": {
      "小朋友": "child",
      "父母 / 长辈": "elder",
      "兄弟姐妹": "sibling",
      "其他家人": "other_family"
    },
    "hotel": {
      "离轨道站近": "near_metro",
      "安静一点": "quiet",
      "想要浴缸": "bathtub",
      "想要江景 / 景观": "view",
      "洗衣方便": "laundry",
      "停车方便": "parking",
      "没有特别要求": "none"
    },
    "diet": {
      "没有特殊限制": "none",
      "不吃辣": "no_spicy",
      "少辣": "less_spicy",
      "不吃香菜": "no_cilantro",
      "不吃内脏": "no_offal",
      "素食": "vegetarian",
      "海鲜过敏": "seafood_allergy",
      "坚果过敏": "nut_allergy"
    },
    "rule": {
      "需要午休": "nap",
      "每天想留一点自由时间": "free_time",
      "不喜欢纯网红打卡": "avoid_influencer_spots",
      "不想一天跑很多区域": "fewer_areas",
      "同行里有人节奏比较慢": "slow_pace",
      "带婴儿车": "stroller",
      "需要无障碍 / 少台阶": "accessible",
      "没有其他特别要求": "none"
    }
  },
  "cities": {
    "上海": "shanghai",
    "北京": "beijing",
    "广州": "guangzhou",
    "深圳": "shenzhen",
    "香港": "hong_kong",
    "澳门": "macao",
    "成都": "chengdu",
    "杭州": "hangzhou",
    "武汉": "wuhan",
    "西安": "xian",
    "长沙": "changsha",
    "南京": "nanjing",
    "郑州": "zhengzhou",
    "昆明": "kunming",
    "保定": "baoding",
    "包头": "baotou",
    "北海": "beihai",
    "长春": "changchun",
    "常州": "changzhou",
    "重庆": "chongqing",
    "大理": "dali",
    "大连": "dalian",
    "东莞": "dongguan",
    "敦煌": "dunhuang",
    "佛山": "foshan",
    "福州": "fuzhou",
    "桂林": "guilin",
    "贵阳": "guiyang",
    "哈尔滨": "harbin",
    "海口": "haikou",
    "合肥": "hefei",
    "黄山": "huangshan",
    "呼和浩特": "hohhot",
    "惠州": "huizhou",
    "嘉兴": "jiaxing",
    "济南": "jinan",
    "金华": "jinhua",
    "九江": "jiujiang",
    "兰州": "lanzhou",
    "拉萨": "lhasa",
    "丽江": "lijiang",
    "洛阳": "luoyang",
    "南昌": "nanchang",
    "南宁": "nanning",
    "宁波": "ningbo",
    "青岛": "qingdao",
    "泉州": "quanzhou",
    "三亚": "sanya",
    "绍兴": "shaoxing",
    "沈阳": "shenyang",
    "石家庄": "shijiazhuang",
    "苏州": "suzhou",
    "台州": "taizhou",
    "太原": "taiyuan",
    "天津": "tianjin",
    "温州": "wenzhou",
    "乌鲁木齐": "urumqi",
    "无锡": "wuxi",
    "厦门": "xiamen",
    "西宁": "xining",
    "徐州": "xuzhou",
    "扬州": "yangzhou",
    "烟台": "yantai",
    "宜昌": "yichang",
    "银川": "yinchuan",
    "张家界": "zhangjiajie",
    "湛江": "zhanjiang",
    "中山": "zhongshan",
    "珠海": "zhuhai"
  },
  "places": {
    "洪崖洞": "hongyadong",
    "解放碑": "jiefangbei",
    "十八梯": "shibati",
    "山城步道": "shancheng_trail",
    "李子坝": "liziba",
    "鹅岭二厂": "eling_factory",
    "磁器口": "ciqikou",
    "长江索道": "yangtze_cableway",
    "南山一棵树": "nanshan_yikeshu",
    "观音桥": "guanyinqiao",
    "龙门浩老街": "longmenhao",
    "重庆中国三峡博物馆": "three_gorges_museum",
    "重庆动物园": "chongqing_zoo"
  }
};
function migrateDraft(draft){
  const convert=(values,group)=>(values||[]).map(value=>LEGACY.maps[group][value]|| (value==='其他'?'other':value));
  draft.party.family_members=convert(draft.party.family_members,'family');
  draft.hotel.prefs=convert(draft.hotel.prefs,'hotel');
  draft.food.dietary=convert(draft.food.dietary,'diet');
  draft.hard_rules=convert(draft.hard_rules,'rule');
  draft.trip.destination='chongqing';
  draft.trip.origin=LEGACY.cities[draft.trip.origin]||draft.trip.origin;
  const oldQuick=[...(draft.places.quick||[])];
  draft.places.quick=oldQuick.map(value=>LEGACY.places[value]||value);
  draft.places.must=(draft.places.must||[]).map(placeKey);
  return draft;
}
