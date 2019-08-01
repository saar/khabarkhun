import React from 'react';
import './App.css';


import {AppState} from './store'
import {connect} from "react-redux";

const mapStateToProps = (state: AppState) => ({
    system: state.system,
    chat: state.chat
});


interface AppProps {
    sendMessage: typeof sendMessage
    updateSession: typeof updateSession
    chat: ChatState
    system: SystemState
}

class App extends React.Component<AppProps> {
￼
}

export default connect(mapStateToProps)(App);
￼
