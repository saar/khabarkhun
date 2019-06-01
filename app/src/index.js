import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store'
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import theme from './themes';
import './styles/index.scss'

render(
	<Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
		<App/>
		</ThemeProvider>
	</Provider>
	, document.getElementById('root'));

serviceWorker.register();
