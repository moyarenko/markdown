/* eslint-disable no-param-reassign, react/jsx-props-no-spreading, no-fallthrough */

const PropTypes = require('prop-types');
const React = require('react');

const Lightbox = require('./Lightbox');

class Image extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lightbox: false,
    };
    this.lightbox = React.createRef();

    this.toggle = this.toggle.bind(this);
    this.handleKey = this.handleKey.bind(this);

    this.isEmoji = props.className === 'emoji';
  }

  componentDidMount() {
    this.lightboxSetup();
  }

  toggle(toState) {
    if (this.props.className === 'emoji') return;

    if (typeof toState === 'undefined') toState = !this.state.lightbox;

    if (toState) this.lightboxSetup();

    this.setState({ lightbox: toState });
  }

  lightboxSetup() {
    const $el = this.lightbox.current;
    if ($el)
      setTimeout(() => {
        $el.scrollTop = ($el.scrollHeight - $el.offsetHeight) / 2;
      }, 0);
  }

  handleKey(e) {
    let { key, metaKey: cmd } = e;

    cmd = cmd ? 'cmd+' : '';
    key = `${cmd}${key.toLowerCase()}`;

    switch (key) {
      case 'cmd+.':
      case 'escape':
        // CLOSE
        this.toggle(false);
        break;
      case ' ':
      case 'enter':
        // OPEN
        if (!this.state.open) this.toggle(true);
        e.preventDefault();
      default:
    }
  }

  render() {
    const { props } = this;
    const { alt, lazy = true } = props;

    if (this.isEmoji) {
      return <img {...props} alt={alt} loading={lazy ? 'lazy' : ''} />;
    }

    return (
      <span
        aria-label={alt}
        className="img"
        onClick={() => this.toggle()}
        onKeyDown={this.handleKey}
        role={'button'}
        tabIndex={0}
      >
        <img {...props} alt={alt} loading={lazy ? 'lazy' : ''} />
        <Lightbox ref={this.lightbox} {...props} onScroll={() => this.toggle(false)} opened={this.state.lightbox} />
      </span>
    );
  }
}

Image.propTypes = {
  align: PropTypes.string,
  alt: PropTypes.string,
  caption: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lazy: PropTypes.bool,
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Image.defaultProps = {
  align: '',
  alt: '',
  caption: '',
  height: 'auto',
  src: '',
  title: '',
  width: 'auto',
};

Image.sanitize = sanitizeSchema => {
  sanitizeSchema.attributes.img = ['className', 'title', 'alt', 'width', 'height', 'align', 'src', 'longDesc'];

  return sanitizeSchema;
};

const CreateImage =
  ({ lazyImages }) =>
  // eslint-disable-next-line react/display-name
  props =>
    <Image lazy={lazyImages} {...props} />;

module.exports = CreateImage;
