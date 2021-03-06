import p5 from 'p5';
import ml5 from 'ml5';

//p5 declarations
let video;
let features;
let knn;
let labelP;
let x;
let y;
let label = 'nothing';
let myp5;
let btnHeight = 11;
const canvasDimensions = {width: 720, height: 405}

//Button Declaration
let loadButton;

const App = (App) => 
{

    /**
    * p5 Initialization Function.
    */
    
    App.setup = () => 
    {
        //Canvas and Framerate setup
        App.createCanvas(canvasDimensions.width, canvasDimensions.height);

        //Video creation
        video = App.createCapture(App.VIDEO);
        video.hide()
        video.size(canvasDimensions.width, canvasDimensions.height);

        //ML SETUP
        features = ml5.featureExtractor("MobileNet", modelReady);

        //LABEL CREATION
        labelP = App.createP('need training data');
        labelP.style("font-size", "18pt");

        //CIRCLE POSITION
        x = App.width/2;
        y = App.height/2;
    }


    /**
    * p5 "ticker" function runs every frame.
    */
    
    App.draw = () =>
    {
        // FLIPPING VIDEO CAPTURE
        App.push();
        App.translate(canvasDimensions.width,0);
        App.scale(-1,1);
        App.image(video, 0, 0, canvasDimensions.width, canvasDimensions.height);
        App.pop();

        //FOR ELLISE DRAW
        //App.background(0);
        App.fill(255,125,5);
        App.ellipse(x,y,24);


            if (label == 'left') 
            {
                x--;
            } 
            else if (label == 'right') 
            {
                x++;
            } 
            else if (label == 'up') 
            {
                y--;
            } 
            else if (label == 'down') 
            {
                y++;
            }
    }

    /**
    * Loads json file of the model.
    */
    
    function LoadModel()
    {
        knn = ml5.KNNClassifier();
        labelP.html('Loading KNN Data...');
        knn.load('./json/knn-data.json', () => 
        {
            goClassify();
        });
    }

    /**
    * Classifies whats in the video after its been trained.
    *
    * @return {results} Returns an object of results.
    */
    
    function goClassify()
    {
        const logits = features.infer(video);
        knn.classify(logits, (error, result) => {
            if(error)
            {
                console.error(error);
            }
            else
            {
                label = GetLabel(result);
                labelP.html(GetLabel(result));
                console.log(GetLabel(result));
                goClassify();
            }
        });
    }
    
    /**
    * Returns label from confidenceByLabel propertie from the result object.
    *
    * @param {obj} result the results object from the models guess.
    * @return {string} Label.
    */
    
    function GetLabel(result) {
        const entries = Object.entries(result.confidencesByLabel);
        let greatestConfidence = entries[0];
        for(let i = 0; i < entries.length; i++) {
          if(entries[i][1] > greatestConfidence[1]) {
            greatestConfidence = entries[i];
          }
        }
        return greatestConfidence[0];
      }

    /**
    * Callback for when the model is loaded.
    *
    * @return {string} Updates html element to let the user know it's ready.
    */
    
    function modelReady()
    {
        labelP.html('MobileNet is now ready, please load your KNN data by clicking the load knn data button.');

        //Button Creation
        loadButton = new Button('Load KNN Data', 'Load_Button', {x:0 ,y:canvasDimensions.height+btnHeight}).InstantiateButton();
        loadButton.mousePressed(LoadModel);
    }
}

myp5 = new p5(App);


/**
* Class to easily create and manage a p5 button
*
* @param {text} text String for button text.
* @param {name} name Name of the button for reference.
* @param {position} position Where to position the button on the webpage.
* @param {array} array Array to push the button to for easy management.
* @return {button} Created p5 button.
*/

class Button
{
    constructor(text, name, position, array=undefined)
    {
        this.text = text;
        this.name = name;
        this.position = {x: position.x, y: position.y};
        this.array = array;
    }

    InstantiateButton()
    {
        let btn = myp5.createButton(this.text);
        btn.name = this.name;
        btn.position(this.position.x, this.position.y);
        this.array != undefined ? this.array.push(btn) : console.warn('No array was proved to add list of buttons to.');
        return btn;
    }
}