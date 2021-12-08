import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Button, Dimensions, View, Image, Text, TextPropTypes, TouchableHighlight } from 'react-native';
import { useNavigation, useRoute, CommonActions, NavigationContainer } from '@react-navigation/native';
import {Database} from "../../Database.js"
import SignatureScreen from "react-native-signature-canvas";

const db = new Database("result.db");
let tid = 0;

export const SwipeCanvas = (props) => {

    //initializing refs and states
    const ref = useRef();
    const route = useRoute();
    const navigation = useNavigation();
    const [trialCount, setTrialCount] = useState(0)
    const [trialState, setTrialState] = useState(true)
    let prod = route.params.product
    let dev = route.params.device
    let pid = route.params.PID
    const style = `.m-signature-pad {box-shadow: none; border: none; } 
    .m-signature-pad--body {border: none;}
    body,html {
    width: 100%; height: 100%;}`;

    //create entry in swipe test summary table at start
    useEffect(() => {
      navigation.setOptions({
        headerLeft: () => (<View></View>),
        headerRight: () => (<View style={{flexDirection:"row"}}>
            <Button onPress = {()=>navigation.goBack()} title = 'Quit' color = "#f11e"></Button>
            </View>)
      })

      //function to write testid data to db
      async function writeData() {
        const res1 = await db.execute("insert into summary (device, testProduct, testStatus, testType, pid) values (?, ?, ?, ?, ?)", [dev,prod,false,"swiping",pid])
        tid = res1.insertId
        //console.log(res1)
      }
      writeData()
    },[])

    function handleNext(){
      setTrialCount(trialCount+1)
      ref.current.clearSignature()
      setTrialState(true)
    }

    // Called after ref.current.readSignature() reads a non-empty base64 string
    async function handleOK(signature){
      //console.log(signature)
      let wth = 0
      let ht = 0
      await Image.getSize(signature, (width, height) => {
        wth = width;
        ht = height
        db.execute("update swipeResult set xPX = ? , yPX = ?, base64img =? where tid = ? and trialNumber = ?",[ht, wth, signature, tid, trialCount])
      }, (error) => {
        console.error(`Couldn't get the image size: ${error.message}`);
      });
      setTrialState(false)
      //ref.current.clearSignature()
      console.log(trialCount)
      if(trialCount==9){
        await db.execute("update summary set testStatus = ? where id = ?", [true, tid])
        navigation.dispatch(
          CommonActions.reset({
              index: 1,
              routes: [
              { name: 'Home' },
              {
                  name: 'swipeResultPage',
                  params:  {tid: tid, device: dev, product: prod, pid:pid}
              },
              ],
          })
          );
      }
    };
  
    // Called after ref.current.readSignature() reads an empty string
    const handleEmpty = () => {
      console.log("Empty");
    };
  
    // Called after ref.current.clearSignature()
    const handleClear = () => {
      console.log("clear success!");
    };
  
    // Called after end of stroke
    const handleEnd = () => {
      ref.current.getData()
      ref.current.readSignature()
    };
  
    // Called after ref.current.getData()
    async function handleData(data){
      data = JSON.parse(data);
      var minX = Math.min.apply(null, data[0].points.map(function(a){return a.x;}))
         ,maxX = Math.max.apply(null, data[0].points.map(function(a){return a.x;}))
      var minY = Math.min.apply(null, data[0].points.map(function(a){return a.y;}))
         ,maxY = Math.max.apply(null, data[0].points.map(function(a){return a.y;}))
         await db.execute("insert into swipeResult (tid, yDP, xDP, trialNumber) values (?,?,?,?)",[tid, maxX-minX, maxY-minY, trialCount])
    };
  
    return (

      <View style = {{...styles.container}}>
      <View pointerEvents={trialState==true?"auto":"none"} style = {{...styles.container, alignItems: "center", justifyContent: "flex-end"}}>
      <Text style={{position:"absolute", marginTop: "5%", zIndex: 30, fontSize: 25}}>Trial {trialCount+1<10?trialCount+1:10} of 10</Text>
      <SignatureScreen
        ref={ref}
        onOK = {handleOK}
        onEnd={handleEnd}
        onEmpty={handleEmpty}
        onClear={handleClear}
        onGetData={handleData}
        disabled = {true}
        minWidth={6}
        maxWidth={9}
        imageType={"image/png"}
        trimWhitespace = {true}
        webStyle={style} 
      />
      </View>
      <View style={{alignSelf:"center", position: "absolute", bottom: "7%", zIndex: 15, width: "50%"}}>
        <TouchableOpacity disabled = {trialState==false?false:true} style={(trialState)?{...styles.disabledNextButton}:{...styles.nextButton}} onPress={handleNext}>
          <Text>{trialState==false && trialCount < 9 ?'Next trial':'Swipe'}</Text>
        </TouchableOpacity>
      </View>
      </View>

    );
  };

const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      nextButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "gray",
        zIndex:10,
        padding: 20,
        borderRadius: 20,
      },
      disabledNextButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: "red",
        borderWidth: 2,
        backgroundColor: "#FDFDFD",
        elevation: 7,
        zIndex:10,
        padding: 20,
        borderRadius: 20,
      }
 }); 