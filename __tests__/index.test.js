const { mount } = require('enzyme');
const React = require('react');
const BaseUrlContext = require('../contexts/BaseUrl');

const markdown = require('../index');
const { tableFlattening } = require('../processor/plugin/table-flattening');
const { options } = require('../options.js');

test('it should have the proper utils exports', () => {
  expect(typeof markdown.utils.BaseUrlContext).toBe('object');
  expect(typeof markdown.utils.GlossaryContext).toBe('object');
  expect(typeof markdown.utils.VariablesContext).toBe('object');

  expect(markdown.utils.options).toStrictEqual({
    compatibilityMode: false,
    copyButtons: true,
    correctnewlines: false,
    markdownOptions: {
      fences: true,
      commonmark: true,
      gfm: true,
      ruleSpaces: false,
      listItemIndent: '1',
      spacedTable: true,
      paddedTable: true,
      setext: true,
    },
    normalize: true,
    settings: { position: false },
  });
});

test('image', () => {
  expect(mount(markdown.default('![Image](http://example.com/image.png)')).html()).toMatchSnapshot();
});

test('heading', () => {
  expect(mount(markdown.default('## Example Header')).html()).toMatchSnapshot();
});

test('magic image', () => {
  expect(
    mount(
      markdown.default(
        `
    [block:image]
    {
      "images": [
        {
          "image": [
            "https://files.readme.io/6f52e22-man-eating-pizza-and-making-an-ok-gesture.jpg",
            "man-eating-pizza-and-making-an-ok-gesture.jpg",
            1024,
            682,
            "#d1c8c5"
          ],
          "caption": "A guy. Eating pizza. And making an OK gesture.",
          "sizing": "full"
        }
      ]
    }
    [/block]
    `,
        options
      )
    ).html()
  ).toMatchSnapshot();
});

test('list items', () => {
  expect(mount(markdown.default('- listitem1')).html()).toMatchSnapshot();
});

test('check list items', () => {
  expect(mount(markdown.default('- [ ] checklistitem1\n- [x] checklistitem1')).html()).toMatchSnapshot();
});

test('gemoji generation', () => {
  const gemoji = mount(markdown.default(':sparkles:'));
  expect(gemoji.find('.lightbox').exists()).toBe(false);
});

test('should strip out inputs', () => {
  const wrap = mount(markdown.default('<input type="text" value="value" />'));
  expect(wrap.exists()).toBe(false);
});

test('tables', () => {
  const wrap = mount(
    markdown.default(`| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
  `)
  );
  expect(wrap.find('Table').html()).toMatchSnapshot();
});

test('headings', () => {
  const wrap = mount(
    markdown.default(`# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`)
  );
  expect(wrap.find('Heading')).toHaveLength(6);
});

test('anchors', () => {
  expect(
    mount(
      markdown.default(`
[link](http://example.com)
[xss](javascript:alert)
[doc](doc:slug)
[ref](ref:slug)
[blog](blog:slug)
[changelog](changelog:slug)
[page](page:slug)
  `)
    ).html()
  ).toMatchSnapshot();
});

test('anchor target: should default to _self', () => {
  expect(mount(markdown.default('[test](https://example.com)')).html()).toMatchSnapshot();
});

test('anchor target: should allow _blank if using HTML', () => {
  expect(mount(markdown.default('<a href="https://example.com" target="_blank">test</a>')).html()).toMatchSnapshot();
});

test('anchor target: should allow download if using HTML', () => {
  expect(
    mount(markdown.default('<a download="example.png" href="" target="_blank">test</a>')).html()
  ).toMatchSnapshot();
});

test('anchors with baseUrl', () => {
  const wrapper = mount(
    React.createElement(
      BaseUrlContext.Provider,
      {
        value: '/child/v1.0',
      },
      markdown.html(
        `
[doc](doc:slug)
[ref](ref:slug)
[blog](blog:slug)
[changelog](changelog:slug)
[page](page:slug)
  `
      )
    )
  );
  expect(wrapper.html()).toMatchSnapshot();
});

test('emojis', () => {
  expect(
    mount(
      markdown.default(`
:joy:
:fa-lock:
:unknown-emoji:
  `)
    ).html()
  ).toMatchSnapshot();
});

describe('code samples', () => {
  it('should codify code', () => {
    const wrap = mount(
      markdown.default(`
  \`\`\`javascript
  var a = 1;
  \`\`\`

  \`\`\`
  code-without-language
  \`\`\`
  `)
    );
    expect(wrap.find('pre')).toHaveLength(2);
    expect(wrap.find('button')).toHaveLength(2);
  });

  describe('`copyButtons` option', () => {
    it('should not insert the CopyCode component if `copyButtons=false`', () => {
      const elem = mount(
        markdown.react('This is a sentence and it contains a piece of `code` wrapped in backticks.', {
          copyButtons: false,
        })
      );

      expect(elem.find('button')).toHaveLength(0);
    });
  });
});

test('should render nothing if nothing passed in', () => {
  expect(markdown.html('')).toBeNull();
});

test('`correctnewlines` option', () => {
  expect(mount(markdown.react('test\ntest\ntest', { correctnewlines: true })).html()).toBe('<p>test\ntest\ntest</p>');
  expect(mount(markdown.react('test\ntest\ntest', { correctnewlines: false })).html()).toBe(
    '<p>test<br>\ntest<br>\ntest</p>'
  );
});

// TODO not sure if this needs to work or not?
// Isn't it a good thing to always strip HTML?
describe('`stripHtml` option', () => {
  it('should allow html by default', () => {
    expect(markdown.html('<p>Test</p>')).toBe('<p>Test</p>');
    expect(markdown.html('<p>Test</p>', { stripHtml: false })).toBe('<p>Test</p>');
  });

  it.skip('should escape unknown tags', () => {
    expect(markdown.html('<unknown-tag>Test</unknown-tag>')).toBe('<p>&lt;unknown-tag&gt;Test&lt;/unknown-tag&gt;</p>');
  });

  it('should allow certain attributes', () => {
    expect(markdown.html('<p id="test">Test</p>')).toBe('<p id="test">Test</p>');
  });

  it('should strip unknown attributes', () => {
    expect(markdown.html('<p unknown="test">Test</p>')).toBe('<p>Test</p>');
  });

  it.skip('should escape everything if `stripHtml=true`', () => {
    expect(markdown.html('<p>Test</p>', { stripHtml: true })).toBe('<p>&lt;p&gt;Test&lt;/p&gt;</p>\n');
  });
});

test('should strip dangerous iframe tag', () => {
  expect(mount(markdown.react('<p><iframe src="javascript:alert(\'delta\')"></iframe></p>')).html()).toBe('<p></p>');
});

test('should strip dangerous img attributes', () => {
  expect(mount(markdown.default('<img src="x" onerror="alert(\'charlie\')">')).html()).toBe(
    '<span aria-label="" class="img" role="button" tabindex="0"><img src="x" align="" alt="" caption="" height="auto" title="" width="auto"><span class="lightbox" role="dialog" tabindex="0"><span class="lightbox-inner"><img src="x" align="" caption="" height="auto" title="Click to close..." width="auto" alt="" class="lightbox-img" loading="lazy"></span></span></span>'
  );
});

describe('tree flattening', () => {
  it('should bring nested mdast data up to the top child level', () => {
    const text = `

    |  | Col. B  |
    |:-------:|:-------:|
    | Cell A1 | Cell B1 |
    | Cell A2 | Cell B2 |
    | Cell A3 | |

    `;

    const table = markdown.hast(text).children[1];
    expect(table.children).toHaveLength(2);
    expect(table.children[0].value).toStrictEqual('Col. B');
    expect(table.children[1].value).toStrictEqual('Cell A1 Cell B1 Cell A2 Cell B2 Cell A3');
  });

  it('should not throw an error if missing values', () => {
    const tree = {
      tagName: 'table',
      children: [
        {
          tagName: 'tHead',
        },
        {
          tagName: 'tBody',
        },
      ],
    };

    const [head, body] = tableFlattening(tree).children;
    expect(head.value).toStrictEqual('');
    expect(body.value).toStrictEqual('');
  });
});

describe('export multiple Markdown renderers', () => {
  const text = `# Hello World

  | Col. A  | Col. B  | Col. C  |
  |:-------:|:-------:|:-------:|
  | Cell A1 | Cell B1 | Cell C1 |
  | Cell A2 | Cell B2 | Cell C2 |
  | Cell A3 | Cell B3 | Cell C3 |

  [Embed Title](https://jsfiddle.net/rafegoldberg/5VA5j/ "@embed")

  > ❗️ UhOh
  >
  > Lorem ipsum dolor sit amet consectetur adipisicing elit.


  `;
  const tree = {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 1,
        children: [
          {
            type: 'text',
            value: 'Hello World',
          },
        ],
      },
    ],
  };

  it('renders plain markdown as React', () => {
    expect(markdown.plain(text)).toMatchSnapshot();
  });

  it('renders custom React components', () => {
    expect(markdown.react(text)).toMatchSnapshot();
  });

  it('renders hAST', () => {
    expect(markdown.hast(text)).toMatchSnapshot();
  });

  it('renders mdAST', () => {
    expect(markdown.mdast(text)).toMatchSnapshot();
  });

  it('renders MD', () => {
    expect(markdown.md(tree)).toMatchSnapshot();
  });

  it('renders plainText from AST', () => {
    expect(markdown.astToPlainText(tree)).toMatchSnapshot();
  });

  it('astToPlainText should return an empty string if no value', () => {
    expect(markdown.astToPlainText()).toStrictEqual('');
  });

  it('allows complex compact headings', () => {
    const mdxt = `#Basic Text

##🙀 oh noes!
###**6**. Oh No

Lorem ipsum dolor!`;
    const html = markdown.html(mdxt);
    expect(html).toMatchSnapshot();
  });

  it('renders HTML', () => {
    expect(markdown.html(text)).toMatchSnapshot();
  });

  it('returns null for blank input', () => {
    expect(markdown.html('')).toBeNull();
    expect(markdown.plain('')).toBeNull();
    expect(markdown.react('')).toBeNull();
    expect(markdown.hast('')).toBeNull();
    expect(markdown.mdast('')).toBeNull();
    expect(markdown.md('')).toBeNull();
  });
});

describe('prefix anchors with "section-"', () => {
  it('should add a section- prefix to heading anchors', () => {
    expect(markdown.html('# heading')).toMatchSnapshot();
  });

  it('"section-" anchors should split on camelCased words', () => {
    const heading = mount(markdown.react('# camelCased'));
    const anchor = heading.find('.heading-anchor_backwardsCompatibility').at(0);

    expect(anchor.props().id).toMatchSnapshot('section-camel-cased');
  });
});
