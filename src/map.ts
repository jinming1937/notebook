import { IContent } from "./entity/common";
import { getContentTree } from "./net/content";

type IData = {
  name: string;
  value?: number;
  id: number;
  itemStyle?: {
    color: string;
  };
  children?: IData[];
}

function formatContent(data: IContent): IData {
  const item: IData = {
    name: data.name,
    id: data.id,
  }
  if (data.children.length > 0) {
    const children: IData[] = [];
    data.children.forEach((i) => {
      if (i.id !== 4) { // 4 工作
        children.push(formatContent(i));
      }
    })
    item.children = children;
  } else {
    item.value = 1;
  }

  return item;
}

function init() {
  const theme = new Date().getHours() >= 18 ? 'dark' : null;
  var dom = document.getElementById('container');
  var myChart = (window as any).echarts.init(dom, theme, {
    renderer: 'canvas',
    useDirtyRect: false
  });

  // 获取数据
  getContentTree<IContent>().then((data: IContent) => {
    if (data) {
      const da = formatContent(data);

      const option = {
        // darkMode: true,
        // backgroundColor: "#100C2A",
        title: {
          text: 'Knowledge',
          subtext: 'Source: engineering knowledge map',
          textStyle: {
            fontSize: 14,
            align: 'center'
          },
          subtextStyle: {
            align: 'center'
          },
          sublink: '-'
        },
        series: {
          type: 'sunburst',
          data: da.children,
          radius: [0, '95%'],
          sort: undefined,
          emphasis: {
            focus: 'ancestor'
          },
          // 是否下钻：旭日图默认支持数据下钻，也就是说，当用户点击了某个扇形块之后，将会以该节点作为根结点显示，并且在中间出现一个返回上层节点的圆。
          // nodeClick: false,
          levels: [
            {},
            {
              r0: '15%',
              r: '35%',
              itemStyle: {
                borderWidth: 2
              },
              label: {
                rotate: 'tangential'
              }
            },
            {
              r0: '35%',
              r: '70%',
              label: {
                align: 'right'
              }
            },
            {
              r0: '70%',
              r: '72%',
              label: {
                position: 'outside',
                padding: 3,
                silent: false
              },
              itemStyle: {
                borderWidth: 3
              }
            }
          ]
        }
      };

      if (option && typeof option === 'object') {
        myChart.setOption(option);
      }

    }
  });

  myChart.on('click', function(params: any) {
    // 控制台打印数据的名称
    console.log(params.name, params.data.id, params.value);
  });

  window.addEventListener('resize', myChart.resize);
}

window.onload = function() {
  init();
}

