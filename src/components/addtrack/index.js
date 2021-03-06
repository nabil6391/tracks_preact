import {h, Component } from 'preact';

import * as actions from '../../store/actions';
import { dRaf } from '../../lib/utils';

export default class AddTrack extends Component {

  state = {
      kind: 'timer',
      acss: '',
      style: ''
  }

  setType(e) {
    this.setState({kind: e});
  }

  setTimer = () => this.setType('timer');
  setCounter = () => this.setType('counter');

  componentDidMount() {
    this.setState({
      acss: '',
      style: 'transition: transform 200ms ease-out'
    });
    this.forceUpdate();
    dRaf(() =>{
      this.Input.focus();
      this.setState({acss: 'in'});
    });
  }

  onKeyPress = (event) => {
    if(event.keyCode == 13) {
      this.addAction();
    }
  }

  close() {
    dRaf(() => {
      this.setState({acss: ''});
      setTimeout(this.props.close, 200);
    })
  }

  addAction() {
    // console.log('context', this.context, this);
    if (this.Input.value.length < 2) {
      this.Input.focus();
      return;
    }

    let store = this.context.store;
    store.dispatch(actions.addTrack({
      kind: this.state.kind,
      desc: this.Input.value
    }));
    // components are recycled... clean it..
    this.Input.value = '';
    // this.props.close();
    this.close();
  }

  render(props, {kind, acss, style}) {
    return (
      <div className={ 'card anim addTrack ' + (acss || '')}
        style={style}>
        <div class="close" onClick={this.close.bind(this)} >
          <img src="assets/close.svg" />
        </div>

      <h2>ADD A NEW TRACK</h2>

      <input name="desc" type="text"
        ref={(input) => this.Input = input }
        onkeyup={this.onKeyPress}
        placeholder="Add your track title" />

      <div className="kind">
        <div
          className={'ele ' + (kind=='counter' ? 'enabled' : '')}
          onClick={ this.setCounter  }>
          <img src="./assets/counter.svg" alt="counter icon" />
          <label>Counter</label>
        </div>
        <div
          className={'ele ' + (kind=='timer' ? 'enabled' : '')}
          onClick={ this.setTimer }>
          <img src="./assets/timer.svg" alt="timer icon" />
          <label>Timer</label>
        </div>
      </div>
      <button onClick={this.addAction.bind(this)}>ADD</button>
    </div>
    )
  }
}
