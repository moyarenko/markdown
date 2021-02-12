const options = {
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
  settings: {
    position: false,
  },
};

/**
 * @note disabling `newline`, `paragraph`, or `text` tokenizers trips Remark into an infinite loop!
 */
const blocks = [
  // 'newline',
  'indentedCode',
  'fencedCode',
  'blockquote',
  'atxHeading',
  'thematicBreak',
  'list',
  'setextHeading',
  'html',
  'footnote',
  'definition',
  'table',
  // 'paragraph',
];

const inlines = [
  'escape',
  'autoLink',
  'url',
  'html',
  'link',
  'reference',
  'strong',
  'emphasis',
  'deletion',
  'code',
  'break',
  // 'text',
];

const toBeDecorated = {
  inlines: inlines.filter(i => !['link', 'reference'].includes(i)),
  blocks: [],
};

const disableTokenizers = {
  inlines: {
    disableTokenizers: {
      inline: toBeDecorated.inlines,
      block: toBeDecorated.blocks,
    },
  },
  blocks: {
    disableTokenizers: {
      inline: inlines.filter(i => !toBeDecorated.inlines.includes(i)),
      block: blocks.filter(b => !toBeDecorated.blocks.includes(b)),
    },
  },
};

const parseOptions = (userOpts = {}) => {
  let opts = { ...options, ...userOpts };

  if (opts.disableTokenizers in disableTokenizers) {
    opts = { ...opts, ...disableTokenizers[opts.disableTokenizers] };
  } else if (opts.disableTokenizers) {
    throw new Error(
      `opts.disableTokenizers "${opts.disableTokenizers}" not one of "${Object.keys(disableTokenizers)}"`
    );
  }

  return opts;
};

export { options, parseOptions };
