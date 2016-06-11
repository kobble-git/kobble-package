'use babel';

import env from './env';
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore-plus';

import {FlowCard} from './components';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

export let FlowComponentJsx = (self, cards) => (
  <div className="home-layout-container">
        {_.map(cards, (card, i) => {
          return (<div className="home-card-container">
            <FlowCard card={card}/>
          </div>)
        })}
  </div>
);

export let FlowCardJsx = (self, card) => (
  <Card expanded={card.expanded}>
    <CardHeader textStyle={{"padding-right" : 0}}
      title={card.title}
      subtitle={card.desc}
      titleStyle={{"font-size":"14px"}}
      titleColor="#00A31C"
      style={{padding:"8px"}}
    />
    <CardText expandable={true}>
      <TextField errorText={card.projectErrorText} hintText="Enter Project Name" fullWidth={true} onChange={self.handleProjectChange}/>
      <TextField errorText={card.filenameErrorText} hintText="Enter Flow Name" fullWidth={true} onChange={self.handleFilenameChange}/>
    </CardText>
    <CardActions>
      <FlatButton label={card.buttonText} onClick={async () => {
        let nstate = _.extend({}, card);
        nstate.action = await card.action(nstate);
        self.setState(nstate);
      }}/>
    </CardActions>
  </Card>
);
