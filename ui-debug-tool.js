// ==UserScript==
// @name         UI debug tool
// @namespace    http://github.com/xfl12345
// @version      0.1
// @description  便于前端开发者调试ui
// @author       xfl12345
// @mat
// @include      *
// @grant        none
// ==/UserScript==

(function () {
    const cssClass = document.createElement('style');
    cssClass.type = 'text/css';
    cssClass.innerHTML = `
.debugBorder {
  box-sizing: border-box;
  border: 1px dashed hotpink;
}

.debugBorder2 {
  box-sizing: border-box;
  border: 1px dashed aqua;
}
`;
    document.querySelector('head').appendChild(cssClass);

    let debugEnableMouse = false;
    let debugEnableWindow = false;

    const DEBUG_KEY_CODE = 191; // '/' - 191 修改这里绑定自己的快捷键
    let debugKeyCodeHitCount = 0;
    const DEBUG_KEY_CODE_HIT_COUNT_ENABLE_MOUSE = 5; // 累计连续输入 5 次 '/' 即可开启 鼠标 DEBUG 模式
    const DEBUG_KEY_CODE_HIT_COUNT_ENABLE_WINDOW = 7; // 累计连续输入 7 次 '/' 即可开启 WIndow DEBUG 模式
    const DEBUG_DISABLE_KEY_CODE = 220; // '\' - 220 修改这里绑定自己的快捷键
    let debugDisableKeyCodeHitCount = 0;
    const DEBUG_DISABLE_KEY_CODE_HIT_COUNT_EXIT = 3; // 累计连续输入 3 次 '\' 即可退出 所有 DEBUG 模式

    function isUndefinedOrNull(val) {
        return typeof val === 'undefined' || val === null;
    }

    const htmlTagNames = [
        'a',
        'abbr',
        'acronym',
        'address',
        'applet',
        'area',
        'article',
        'aside',
        'audio',
        'b',
        'base',
        'basefont',
        'bdi',
        'bdo',
        'bgsound',
        'big',
        'blink',
        'blockquote',
        'body',
        'br',
        'button',
        'canvas',
        'caption',
        'center',
        'cite',
        'code',
        'col',
        'colgroup',
        'command',
        'content',
        'data',
        'datalist',
        'dd',
        'del',
        'details',
        'dfn',
        'dialog',
        'dir',
        'div',
        'dl',
        'dt',
        'element',
        'em',
        'embed',
        'fieldset',
        'figcaption',
        'figure',
        'font',
        'footer',
        'form',
        'frame',
        'frameset',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'head',
        'header',
        'hgroup',
        'hr',
        'html',
        'i',
        'iframe',
        'image',
        'img',
        'input',
        'ins',
        'isindex',
        'kbd',
        'keygen',
        'label',
        'legend',
        'li',
        'link',
        'listing',
        'main',
        'map',
        'mark',
        'marquee',
        'math',
        'menu',
        'menuitem',
        'meta',
        'meter',
        'multicol',
        'nav',
        'nextid',
        'nobr',
        'noembed',
        'noframes',
        'noscript',
        'object',
        'ol',
        'optgroup',
        'option',
        'output',
        'p',
        'param',
        'picture',
        'plaintext',
        'pre',
        'progress',
        'q',
        'rb',
        'rbc',
        'rp',
        'rt',
        'rtc',
        'ruby',
        's',
        'samp',
        'script',
        'section',
        'select',
        'shadow',
        'slot',
        'small',
        'source',
        'spacer',
        'span',
        'strike',
        'strong',
        'style',
        'sub',
        'summary',
        'sup',
        'svg',
        'table',
        'tbody',
        'td',
        'template',
        'textarea',
        'tfoot',
        'th',
        'thead',
        'time',
        'title',
        'tr',
        'track',
        'tt',
        'u',
        'ul',
        'var',
        'video',
        'wbr',
        'xmp',
    ];

    const htmlTagNameSet = new Set();
    for (let i = htmlTagNames.length - 1; i > 0; i -= 1) {
        htmlTagNameSet.add(htmlTagNames[i]);
    }

    const visitAllNode = (debugBorderClassName, rootNode, currentDeep, isDebugMode, maxDeep) => {
        if (isUndefinedOrNull(maxDeep)) {
            maxDeep = Number.MAX_VALUE;
        }
        // Do something else
        const debugCurrentNodeMainInfo = () => {
            console.log(
                'currentDeep=' +
                currentDeep +
                ';' +
                'visitNode=' +
                rootNode.tagName +
                ';' +
                'nodeId=' +
                rootNode.getAttribute('id') +
                ';' +
                'nodeWidth=' +
                getComputedStyle(rootNode).width +
                ';' +
                'nodeHeight=' +
                getComputedStyle(rootNode).height
            );
        };
        if (isDebugMode) {
            debugCurrentNodeMainInfo();
            rootNode.classList.add(debugBorderClassName);
        } else {
            rootNode.classList.remove(debugBorderClassName);
            debugCurrentNodeMainInfo();
        }
        if (currentDeep >= maxDeep || rootNode.childNodes.length === 0) {
            return;
        }
        const childNodes = rootNode.childNodes;
        // console.log('childNodes=', childNodes);
        for (let i = childNodes.length - 1; i >= 0; i -= 1) {
            const childNode = childNodes[i];
            if (
                !isUndefinedOrNull(childNode.tagName) &&
                childNode.tagName.toLowerCase() !== 'script' &&
                htmlTagNameSet.has(childNode.tagName.toLowerCase())
            ) {
                visitAllNode(debugBorderClassName, childNodes[i], currentDeep + 1, isDebugMode, maxDeep);
            }
        }
    };

    let isWindowDebugMode = false;
    window.setDebugMode = (val) => {
        isWindowDebugMode = Boolean(val);
        visitAllNode('debugBorder', document.getElementsByTagName('body')[0], 0, isWindowDebugMode, null);
        return isWindowDebugMode;
    };

    window.addEventListener('keydown', (e) => {
        if (e.keyCode === DEBUG_KEY_CODE) {
            debugKeyCodeHitCount += 1;
            if (debugKeyCodeHitCount === DEBUG_KEY_CODE_HIT_COUNT_ENABLE_MOUSE) {
                debugEnableMouse = true;
            }

            if (debugKeyCodeHitCount === DEBUG_KEY_CODE_HIT_COUNT_ENABLE_WINDOW) {
                debugEnableWindow = true;
                window.setDebugMode(debugEnableWindow);
            }
        } else {
            debugKeyCodeHitCount = 0;
        }

        if (e.keyCode === DEBUG_DISABLE_KEY_CODE) {
            debugDisableKeyCodeHitCount += 1;
            if (debugDisableKeyCodeHitCount === DEBUG_DISABLE_KEY_CODE_HIT_COUNT_EXIT) {
                debugEnableWindow = false;
                debugEnableMouse = false;
                window.setDebugMode(debugEnableWindow);
                visitAllNode('debugBorder2', document.getElementsByTagName('body')[0], 0, false, 0);
            }
        } else {
            debugDisableKeyCodeHitCount = 0;
        }
    });

    window.document.body.addEventListener('mouseover', (event) => {
        if (!debugEnableMouse) {
            const el = event.target;
            if (el.classList.contains('debugBorder2')) {
                visitAllNode('debugBorder2', el, 0, false, 0);
            }
            return;
        }
        const el = event.target; // 鼠标每经过一个元素，就把该元素赋值给变量el
        // console.log('当前鼠标在', el, '元素上');//在控制台中打印该变量
        visitAllNode('debugBorder2', el, 0, true, 0);
    });
    window.document.body.addEventListener('mouseout', (event) => {
        if (!debugEnableMouse) {
            return;
        }
        const el = event.target;
        visitAllNode('debugBorder2', el, 0, false, 0);
    });
})();
