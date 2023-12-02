import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/* Card component: renders a card */
/* Fondamentaly, a card is:
  - a value (e.g. 'HK' for the Heart symbol king
  - a slot (e.g. position of the card used as a React key)
  - a context => 'removed'=the card is invisible, 'hidden'=the card is visible but the value is not displayer (back side card), 'visible'= the card value is displayed
*/

/* Note that according to the card value, an image is displayed for each context:
  - removed: no image
  - hidden: the back side image
  - visible: the card value image (e.g. 'S8' concerns the S8.svg card image */
class Card extends React.Component {

  render() {
    if(this.props.context==='removed'){
      return(
        <button className='card' onClick={()=>this.props.onClick(this.props.slot, this.props.value, this.props.context)} />
      );
    } else if(this.props.context==='hidden'){
      const CARD='/img/cards/BLUE_BACK.svg';
      return (
        <button className='card' onClick={()=>this.props.onClick(this.props.slot, this.props.value, this.props.context)}>
          <img src={CARD} alt='hidden-card'/>
        </button>
      );
    } else {
      const CARD='/img/cards/' + this.props.value + '.svg';
      return (
        <button className='card' onClick={()=>this.props.onClick(this.props.slot, this.props.value, this.props.context)}>
          <img src={CARD} alt='visible-card'/>
      </button>
      );
    }
  }
}

/* Board component: call the Card component passing the cards state and the clickHandler method */
/* Note that this component is structured on a 4 lines array where the Cards are rendered */
class Board extends React.Component {

  render() {
    const cards= this.props.cards.slice();

    return (
      <div className='board'>
        <div className='board-row-0'>
          {cards[0].map(i => (<Card key= {i.slot} slot= {i.slot} value= {i.value} context= {i.context} onClick={this.props.onClick} />))}
        </div>

        <div className='board-row-1'>
          {cards[1].map(i => (<Card key= {i.slot} slot= {i.slot} value= {i.value} context= {i.context} onClick={this.props.onClick} />))}
        </div>

        <div className='board-row-2'>
          {cards[2].map(i => (<Card key= {i.slot} slot= {i.slot} value= {i.value} context= {i.context} onClick={this.props.onClick} />))}
        </div>

        <div className='board-row-3'>
          {cards[3].map(i => (<Card key= {i.slot} slot= {i.slot} value= {i.value} context= {i.context} onClick={this.props.onClick} />))}
        </div>
      </div>
    );
  }
}

/* Hand component: call the Card component passing the cards state and the clickHandler method */
/* Note that inactive cards designs the hidden cards, used as 'lives' for the player, and active card designs the main active hand card */
class Hand extends React.Component {
  render() {
    const hands= this.props.hands.slice();
    const inactiveHandCards= hands.slice(0,23);
    const activeHandCard= hands.slice(23,24);

    return (
      <div className='hand'>
        <div className='hand-row'>
          
          <span className='inactive-hand-cards'>
            {inactiveHandCards.map(i => (<Card key= {i.slot} slot= {i.slot} value= {i.value} context= {i.context} onClick={this.props.onClick} />))}
          </span>

          <span className='active-hand-card'>
            {activeHandCard.map(i => (<Card key= {i.slot} slot= {i.slot} value= {i.value} context= {i.context} onClick={this.props.onClick} />))}
          </span>          

        </div>
      </div>
    )};
}

/* Game component: this component is the main component monitoring the state of all the game (cards value and context in the Board, cards value and context in the Hand, Joker used or not) */
/* This component handle the click events done by the player while playing, so that the state is updated and rendered with all the child-components (Board, Hand and Card) */
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state=init();
  }
  
  /* Event method: on the click on the Joker button */
  useJoker(){
    const hands= this.state.hands.slice();
    hands[23].value = 'JOKER';
    this.setState({hands: hands, jokerUsed: true});
  }

  /* Event method: on the click on a Card component */
  /* This is the core function of the game within all the rules are implmented */
  /* There is mainly three use cases:
    - the player clicks on the active hand card => nothing happens
    - the player clicks on a hand card => the active hand card value is changing according to the hand card remaining
    - the player clicks on a board card => according to the difference of power between the clicked card and the active hand card, nothing happens or the clicked card disappears and news boards cards are revealing their value
  */
  handleClick(slot, value, context) {
    const hands= this.state.hands.slice();
    const cards= this.state.cards.slice();

    /* If the active hand card is clicked */
    if(slot === 58) {
      return;
    } 
    /* If a hand card is clicked */  
      else if(slot >= 35) {
      const index= hands.findIndex(i => i.context === 'hidden');
      if(index=== -1 ){
        return;
      } else {
        hands[index].context='removed';
        hands[23].value=hands[index].value;
      } 
    } 
    /* if a board card is clicked */
    /* note that if the clicked card is not visible or its value comparison function with the active hand card return false, then this method immediatly ends */
      else {
      if(context !== 'visible') {
        return;
      }
      if(!comparePlusOrMinusOne(hands[23].value, value)) {
        return;
      }
      /* if the clicked card is on the 4th line */
      if(slot >=25) {
        const index= cards[3].findIndex(i => i.slot === slot);
        if(index === -1) {
          return;
        } else {
        cards[3][index].context = 'removed';
        hands[23].value = cards[3][index].value;
          if (typeof cards[3][index - 1] !== 'undefined') {
            if(cards[3][index - 1].context === 'removed') {
              if(cards[2][index - 1].value !== '') {
                cards[2][index - 1].context = 'visible';
              }
            }
          }
          if (typeof cards[3][index + 1] !== 'undefined') {
            if(cards[3][index + 1].context === 'removed') {
              if(cards[2][index].value !== '') {
                cards[2][index].context = 'visible';
              }
            }
          }
        }
      } 
      /* if the clicked card is on the 3th line */
        else if(slot >= 16) {
        const index= cards[2].findIndex(i => i.slot === slot);
        if(index === -1) {
          return;
        } else {
        cards[2][index].context = 'removed';
        hands[23].value = cards[2][index].value;
          if (typeof cards[2][index - 1] !== 'undefined') {
            if(cards[2][index - 1].context === 'removed') {
              if(cards[1][index - 1].value !== '') {
                cards[1][index - 1].context = 'visible';
              }
            }
          }
          if (typeof cards[2][index + 1] !== 'undefined') {
            if(cards[2][index + 1].context === 'removed') {
              if(cards[1][index].value !== '') {
                cards[1][index].context = 'visible';
              }
            }
          }
        }
      } 
      /* if the clicked card is on the 2nd line */
        else if(slot >= 8) {
        const index= cards[1].findIndex(i => i.slot === slot);
        if(index === -1) {
          return;
        } else {
        cards[1][index].context = 'removed';
        hands[23].value = cards[1][index].value;
          if (typeof cards[1][index - 1] !== 'undefined') {
            if(cards[1][index - 1].context === 'removed') {
              if(cards[0][index - 1].value !=='') {
                cards[0][index - 1].context = 'visible';
              }
            }
          }
          if (typeof cards[1][index + 1] !== 'undefined') {
            if(cards[1][index + 1].context === 'removed') {
              if(cards[0][index].value !== '') {
                cards[0][index].context = 'visible';
              }
            }
          }
        }
      } 
      /* if the clicked card is on the 1st line */
        else {
        const index= cards[0].findIndex(i => i.slot === slot);
        if(index === -1) {
          return;
        } else {
        cards[0][index].context = 'removed';
        hands[23].value = cards[0][index].value;
        }
      }
    }

  /* Update of the state: hands and cards */
    this.setState({hands: hands});
    this.setState({cards: cards});
  }

/* Renders the Game component:
  - the joker button if not used yet
  - the Board and Hand components
Whatever it renders, props are passed to the child-components (state of the cards and click handler methods)
*/
  render() {
    let jokerHTMLSectionCode = '';

    if(!this.state.jokerUsed) {
      jokerHTMLSectionCode= <button className="joker-button" onClick={()=>this.useJoker()}>Use my joker!</button>;
    }

    return (
      <div className='game'>
        <Board cards={this.state.cards} onClick={(slot, value, context) => this.handleClick(slot, value, context)}/>
        <Hand hands={this.state.hands} onClick={(slot, value, context) => this.handleClick(slot, value, context)}/>
        {jokerHTMLSectionCode}
      </div>
    )};
}

/* Function: compare the difference between the cards */
function comparePlusOrMinusOne(activeCardValue, clickedCardValue) {
  
  /* Specific use case: if the Joker card is active as the main hand card */
  if(activeCardValue === 'JOKER') {
    return true;
  }

  /* Definition of the cards power regarding their value: e.g 'S3' value has a power of 3 */
  /* Special cards such as Jack or Queen must be handled */
  let activeCardPower = activeCardValue[1];
  let clickedCardPower = clickedCardValue[1];

  /* For the active hand card */
  activeCardValue[1] === '1' ? activeCardPower = 10 : 
  activeCardValue[1] === 'J' ? activeCardPower = 11 :
  activeCardValue[1] === 'Q' ? activeCardPower = 12 : 
  activeCardValue[1] === 'K' ? activeCardPower = 13 :
  activeCardValue[1] === 'A' ? activeCardPower = 14 : parseInt(activeCardValue[1]);

  /* For the clicked card on the board */
  clickedCardValue[1] === '1' ? clickedCardPower = 10 : 
  clickedCardValue[1] === 'J' ? clickedCardPower = 11 :
  clickedCardValue[1] === 'Q' ? clickedCardPower = 12 : 
  clickedCardValue[1] === 'K' ? clickedCardPower = 13 :
  clickedCardValue[1] === 'A' ? clickedCardPower = 14 : parseInt(clickedCardValue[1]);

  /* Calculation of the difference between the cards power: must be a positive number */
  let minMaxPower =0;
  activeCardPower > clickedCardPower ? minMaxPower = activeCardPower - clickedCardPower : minMaxPower = clickedCardPower - activeCardPower;

  /* If the difference between card power are equal to 1, then it's okay */
  /* Note: specific use case to take into account if the 'A' and '2' cards are compared together */
  if(minMaxPower === 12 && (activeCardPower === 14 || clickedCardPower === 14)) {
    return true;
  } else if(minMaxPower === 1) {
    return true;
  } else {
    return false;
  }

}

/* Function: initialization of the state of the Game component*/
function init() {
  
  /* initState is the state of all the cards in the board (value, context and slot = position in the board) : there is the cards in game, but also in hands, and a boolean which indicate if the joker has been used or not */
  const initState= {
    cards: [
      [{slot: 1, value: '', context: 'hidden'},{slot: 2, value: '', context: 'removed'}, {slot: 3, value: '', context: 'removed'},{slot: 4, value: '', context: 'hidden'}, {slot: 5, value: '', context: 'removed'},{slot: 6, value: '', context: 'removed'}, {slot: 7, value: '', context: 'hidden'}],
      [{slot: 8, value: '', context: 'hidden'},{slot: 9, value: '', context: 'hidden'}, {slot: 10, value: '', context: 'removed'},{slot: 11, value: '', context: 'hidden'}, {slot: 12, value: '', context: 'hidden'},{slot: 13, value: '', context: 'removed'}, {slot: 14, value: '', context: 'hidden'},{slot: 15, value: '', context: 'hidden'}],
      [{slot: 16, value: '', context: 'hidden'},{slot: 17, value: '', context: 'hidden'}, {slot: 18, value: '', context: 'hidden'},{slot: 19, value: '', context: 'hidden'}, {slot: 20, value: '', context: 'hidden'},{slot: 21, value: '', context: 'hidden'}, {slot: 22, value: '', context: 'hidden'},{slot: 23, value: '', context: 'hidden'}, {slot: 24, value: '', context: 'hidden'}],
      [{slot: 25, value: '', context: 'visible'},{slot: 26, value: '', context: 'visible'}, {slot: 27, value: '', context: 'visible'},{slot: 28, value: '', context: 'visible'}, {slot: 29, value: '', context: 'visible'},{slot: 30, value: '', context: 'visible'}, {slot: 31, value: '', context: 'visible'},{slot: 32, value: '', context: 'visible'}, {slot: 33, value: '', context: 'visible'},{slot: 34, value: '', context: 'visible'}]
    ],
    hands: [
      {slot: 35, value: '', context: 'hidden'},{slot: 36, value: '', context: 'hidden'}, {slot: 37, value: '', context: 'hidden'},{slot: 38, value: '', context: 'hidden'}, {slot: 39, value: '', context: 'hidden'},{slot: 40, value: '', context: 'hidden'}, {slot: 41, value: '', context: 'hidden'},{slot: 42, value: '', context: 'hidden'}, {slot: 43, value: '', context: 'hidden'},{slot: 44, value: '', context: 'hidden'},
      {slot: 45, value: '', context: 'hidden'},{slot: 46, value: '', context: 'hidden'}, {slot: 47, value: '', context: 'hidden'},{slot: 48, value: '', context: 'hidden'}, {slot: 49, value: '', context: 'hidden'},{slot: 50, value: '', context: 'hidden'}, {slot: 51, value: '', context: 'hidden'},{slot: 52, value: '', context: 'hidden'}, {slot: 53, value: '', context: 'hidden'},{slot: 54, value: '', context: 'hidden'},
      {slot: 55, value: '', context: 'hidden'},{slot: 56, value: '', context: 'hidden'}, {slot: 57, value: '', context: 'hidden'},{slot: 58, value: '', context: 'visible'}
    ],
    jokerUsed: false
  };

  /* values is an array containing all the possible card values. This array will then be shuffled randomly and affected to a card value */
  const values=[
    'C2', 'D2', 'H2', 'S2', 
    'C3', 'D3', 'H3', 'S3', 
    'C4', 'D4', 'H4', 'S4', 
    'C5', 'D5', 'H5', 'S5',
    'C6', 'D6', 'H6', 'S6',
    'C7', 'D7', 'H7', 'S7',
    'C8', 'D8', 'H8', 'S8',
    'C9', 'D9', 'H9', 'S9',
    'C10', 'D10', 'H10', 'S10',
    'CJ', 'DJ', 'HJ', 'SJ',
    'CQ', 'DQ', 'HQ', 'SQ',
    'CK', 'DK', 'HK', 'SK',
    'CA', 'DK', 'HA', 'SA',
  ];

  /* Shuffle values */
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = values[i];
    values[i] = values[j];
    values[j] = temp;
    }

  /* Mapping cards values... */
  /* For lines 0 and 1 */
  for(let i=0; i<3; i++) {
    initState.cards[0][3 * i].value= values[i];
    initState.cards[1][3 * i].value= values[2 * i + 3];
    initState.cards[1][3 * i + 1].value= values[2 * i + 4];
  }

  /* For line 2 */
  for(let i = 0;i < 9; i++) {
    initState.cards[2][i].value= values[9 + i];
  }

  /* For line 3 */
  for(let i = 0;i <= 9; i++) {
    initState.cards[3][i].value= values[18 + i];
  }

  /* And for the hands */
   for(let i = 0;i <= 23; i++) {
    initState.hands[i].value= values[28 + i];
  }

  return initState;
}

/* Final render: Game component on the 'root' id */
ReactDOM.render(
  <Game />,
  document.getElementById('root')
);