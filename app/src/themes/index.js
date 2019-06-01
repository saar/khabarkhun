import { createMuiTheme } from '@material-ui/core/styles';
import { pink } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: pink[600]
    },
    secondary: {
      main: pink[900]
    }
  },
  typography: {
    fontFamily: [
      '"vazir"',
      'tahoma'
    ].join(',')
  },
  direction: 'rtl'
});

export default theme;
