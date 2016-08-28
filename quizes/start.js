var buttonClass,
	twitText,
    holder = [],
    addAnswerText,
    i,
    outerText,
    statLine,
    holdAns,
    pollText,
    holderPoll,
    style,
    answerClass,
    flipValue,
    backClass,
    backValue,
    renderArray;

    


var QPoll = React.createClass({
//
// below is for scaling font to fit boxes, needs
// <script src="jquery.boxfit.min.js" type="text/javascript"></script> to work    
//    componentDidMount: function(){
//        $("p").boxfit({align_center: true, align_middle: true, multiline: true});
//            }, 
//    componentDidUpdate: function(){
//        $("p").boxfit({align_center: true, align_middle: true, multiline: true});
//            }, 

    render: function(){
        style = {width: 0};
        flipValue= '';
        if (this.props.flip) {
            flipValue = 'flipped';
        }
        holderPoll =[];
        for (i = 0; i < this.props.answers.length; i++) {
            holderPoll.push(i);
        }
        if (this.props.answers.length>0) {
            style.width =Math.floor(80/this.props.answers.length-4)-0.5+'vw';
        }
        return  <div id = 'qPoll'>
                <div className = 'poll-question'>
                {this.props.question}</div>
                <div className = 'outer-answers'>
                {holderPoll.map((listValue)=>{
                    answerClass = ' yellow-gradient';
                    backClass = ' orange-gradient';
                    backValue = 'Not: ';
                    flipValue='';
                    if (this.props.flip) {flipValue=' flipped ';}
                    if (listValue===this.props.highlight-1){ 
                        answerClass = ' green-gradient ';
                    }

                    if (listValue===this.props.highlight-1 && listValue === Number(this.props.correct)) {
                        backClass = ' green-gradient';
                        backValue = 'Right: ';
                    }
                    if (listValue===this.props.highlight-1 && !(listValue === Number(this.props.correct))) {
                        backValue = 'Wrong: ';
                        backClass= ' red-gradient';
                    }
                    if (!(listValue===this.props.highlight-1) && listValue === Number(this.props.correct)) {
                        backValue = 'Correct: ';
                        backClass = ' blue-gradient';
                    }

                    return <div style= {style} className = {'poll-answer '+flipValue}
                    onClick= {()=>this.props.click(listValue)}>
                    <div className = {'front '+answerClass}>
                    <p>{this.props.answers[listValue]}</p>
                    </div>
                    <div className = {'back '+backClass}>
                    <p>{backValue+this.props.answers[listValue]}</p>
                    </div>
                    </div>
                })}
                </div>
                <div className = 'xer'>
                <button className= 'right main-but' onClick = {this.props.commit}>Commit answer</button>
                </div>
                </div>
    }
});

var QCreator = React.createClass({
render: function() {
    
    holder =[];
    addAnswerText = 'create-text';
    if (this.props.count>=5) {
        addAnswerText+= ' hidden';
    }
    
    for (i = 1; i <= this.props.count+1; i++) {
        holder.push(i);
    }
    return <div id = 'qCreate'>
    <div className = 'create-text'>Question</div>
    <textarea id ="quest-text" onChange = {this.props.question} value = {this.props.storedQuestion}></textarea>
    {holder.map((listValue)=>{
        return<div>
            <div className = 'create-text'>Possible answer ({listValue})</div>
            <input id= {listValue-1} ref = {'answer-'+listValue} onChange = {this.props.answer}
            value = {this.props.storedAnswers[listValue-1]}></input>
       </div>;     
    })}
    <br/>
    <div className = {addAnswerText}>Add possible answer
        <button className = 'right main-but' onClick= {this.props.increaseCount}>+</button>
    </div>
    <br/>
    <div className = 'create-text'>Choose correct answer: </div>
    {holder.map((listValue)=>{
        if (listValue-1 === this.props.highlight && this.props.storedAnswers[listValue-1]){

              return <button className = 'green' onClick = {()=>this.props.setCorrect(listValue)}>{listValue}</button>;
        } else{
            return <button className = 'main-but' onClick = {()=>this.props.setCorrect(listValue)}>{listValue}</button>;
         }   
    })}
    <br/>
    <button className = 'main-but' onClick = {this.props.upload}>Upload</button>
    <button className = 'right main-but' onClick = {this.props.cancel}>Cancel</button>
        </div>
	
}
});

var Quizer =  React.createClass({
 	getInitialState: function(){
    	return {
    		user:false,
    		poll: false,
    		author: false,
    		stats: [0,0],
    		showCreate :false,
            question: '',
            answers: [], 
            correctAnswer: false,
            answerCount:0,
            highlightAnswer: 0,
            showFlipped: false

      	}
    },

    handleTwitter: function(){
      if (this.state.user){
        this.setState({
        	user: false,
    	    author: false,
	   		stats: [0,0],
            showCreate :false 
          });
      } else{
     	self = this;
        var win = window.open('/twitter', "windowname1", 'width=800, height=600'); 
        var logTimer = window.setInterval(function() { 
                    try {if (win.document.body.textContent) {
                        window.clearInterval(logTimer);
                        var url = win.document.URL;
                        var jsonHold =JSON.parse(win.document.body.textContent);
                        self.setState({
                            user: jsonHold.name,
                            stats: jsonHold.stats
                        });
                        win.close();
                        }
                    } catch (error){}
            }, 500);
    	}
  	},

  	handleCreate: function(){
        if (!this.state.showCreate){
            this.setState({
                showCreate :true ,
                poll: false,
                question: '',
                answers: [], 
                correctAnswer: -5,
                answerCount:0,
                highlightAnswer: 0,
                showFlipped: false  
            });
        }
    },

    cancelCreate: function(){
        this.setState({
            showCreate :false,
            question: '',
            answers: [], 
            correctAnswer: false,
            answerCount:0,
            highlightAnswer: 0,
            showFlipped: false  
        });
    },

    setCorrect: function(index){
        
        this.setState({
            correctAnswer: index-1
        });
    },

    tickCount: function(){
        if (this.state.answerCount<5) {
            this.setState({
                answerCount: this.state.answerCount+1
            })
        } else {
            alert("6 answers is quite enough...");
        }
    },

    storeQuestion: function(event){
        
        this.setState({
                question: event.target.value
            });
    },

    handleClear: function(){
        this.setState({
            stats: [0,0]
        });
        $.get( "/clean", {user: this.state.user})
         .done(function( data ){
            if (data.error){
                alert(data.error);
            }
        });
    },

    storeAnswer: function(event){
        holdAns = this.state.answers.slice();
        holdAns[Number(event.target.id)] = event.target.value;
        this.setState({
                answers: holdAns.slice()
            });
    },

    handleUpload: function(){
        if (this.state.question === "") {
            alert('Please write the question');
            return;
        }    
        if (this.state.answerCount<1) {
            alert('Need more answers...');
            return;            
        }
        for (i = 0; i < this.state.answers.length; i++) {
            if (this.state.answers[i].length === 0) {
                alert('Specify answer - ', i+1);
                return;                
            }
        }
        $.get( "/upload",
            {author: this.state.user, question: this.state.question, answers: this.state.answers, right: this.state.correctAnswer, answered: [""]})
        .done(function( data ){
            if (data.error){
                alert(data.error);
            }
        });
    },

  	handleShow: function(){
        this.cancelCreate();
        var self=this;
        $.get( "/show" , {user: this.state.user})
        .done(function( data ){
            if (data.error){
                alert(data.error);
                return;   
            }
            self.setState({
                showCreate :false ,
                poll: true,
                question: data.poll.question,
                answers: data.poll.answers, 
                correctAnswer: data.poll.right,
                answerCount:  data.poll.answers.length,
                highlightAnswer: 0,
                showFlipped: false
            });
        });
    },

    handleAnswer: function(index){
        if (!this.state.showFlipped){
            this.setState({
                highlightAnswer: index+1
            });
        }
    },    

    finalAnswer: function(){
        if (this.state.highlightAnswer ===0){return;}
        this.setState({showFlipped: true});
        if (this.state.user){
            holder = this.state.stats.slice();
            holder[1]++;
            if (this.state.correctAnswer===this.state.highlightAnswer) {holder[0]++;}
            this.setState({stats: holder.slice()});
            $.get( "/updateStats" , {user: this.state.user, question:this.state.question, stats: holder.slice()})
            .done(function( data ){
                if (data.error){
                    alert(data.error);
                }
            });
        }
    },

    render: function(){
        renderArray = [];
        if (this.state.poll) {renderArray.push(<QPoll  question = {this.state.question}
                    answers = {this.state.answers} correct = {this.state.correctAnswer}
                    highlight = {this.state.highlightAnswer} flip = {this.state.showFlipped}
                    click = {this.handleAnswer} commit = {this.finalAnswer}>
                    </QPoll>)}
        if (this.state.showCreate) {renderArray.push(<QCreator upload = {this.handleUpload} question ={this.storeQuestion}
                    cancel = {this.cancelCreate} answer={this.storeAnswer}
                    count = {this.state.answerCount} increaseCount = {this.tickCount}
                    setCorrect = {this.setCorrect} highlight = {this.state.correctAnswer}
                    storedQuestion ={this.state.question} storedAnswers = {this.state.answers}
                    ></QCreator>)}
    	buttonClass = 'main-but';
    	twitText = 'Log out';
        statLine ='';
        if (!this.state.user){
    		buttonClass += ' hidden';
    		twitText = 'Twitter log in';
    	} else{
            statLine += this.state.user;
            if (this.state.stats[0]===0){
                statLine+= ' 0%';
            } else{
                statLine+= ' '+ Math.round(this.state.stats[0]/this.state.stats[1]*100) +'%';
            }

        }

    	return 	<div>
    				<button className = 'main-but' id= "twit-log" onClick = {this.handleTwitter}>
    				{twitText}</button>
    				<button className = {buttonClass} id = "create-but" onClick = {this.handleCreate}>
    				Create new question</button>
    				<br/>
    				<button className = 'main-but' onClick = {this.handleShow}>
    				Show random question</button>
    				<br/>
    				<button className = {buttonClass} onClick = {this.handleClear}>
    				Clear my results</button>
                    {renderArray}
                    <div id = 'stats-div'><span id = 'stats'>{statLine}</span></div>
    				
    				
    			</div>
   }
});


















ReactDOM.render(<Quizer></Quizer>,document.getElementById('box'));
      