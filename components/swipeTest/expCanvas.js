import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Button, Alert, View, Image, Text, StatusBar, TouchableHighlight } from 'react-native';
import { useNavigation, useRoute, CommonActions, NavigationContainer } from '@react-navigation/native';
import {Database} from "../../Database.js"
import { Orientation } from 'expo-orientation-sensor'
import SignatureScreen from "react-native-signature-canvas";

const db = new Database("result.db");
let tid = 0;
let timer
let interval

export const SwipeCanvas = (props) => {

    //initializing refs and states
    const ref = useRef();
    const route = useRoute();
    const [testID, setTestID] = useState(0)
    const [time, setTime] = React.useState(0);
    const [angles, setAngles] = useState({
      yaw: 0,
      pitch: 0,
      roll: 0,
    })
    const navigation = useNavigation();
    const [trialCount, setTrialCount] = useState(0)
    const [trialState, setTrialState] = useState(true)
    const [countdown,setCountdown] = useState(0)
    let prod = route.params.product
    let dev = route.params.device
    let pid = route.params.PID
    let posture = route.params.posture
    let testHand = route.params.hand
    const style = `.m-signature-pad {box-shadow: none;margin-left: 0px;margin-top:0px } 
    .m-signature-pad--body {border: none;}
    body,html {
    width: 100%; height: 100%;}`;

    //create entry in swipe test summary table at start
    useEffect(() => {
      navigation.setOptions({
        headerShown:false,
        gestureEnabled:false,
        headerLeft: () => (<View></View>),
        headerRight: () => (<View style={{flexDirection:"row"}}>
            <Button onPress = {()=>navigation.goBack()} title = 'Quit' color = "#f11e"></Button>
            </View>)
      })

      //function to write testid data to db
      async function writeData() {
        const res1 = await db.execute("insert into summary (device, testDate, testProduct, testStatus, testType, pid, posture,testHand) values (?, DateTime('now', 'localtime'), ?, ?, ?, ?, ?, ?)", [dev,prod,false,"swiping",pid,posture,testHand])
        tid = res1.insertId
        setTestID(tid)
        //console.log(res1)
      }
      writeData()
      StatusBar.setHidden(true)
      
      return () => {
        StatusBar.setHidden(false,'slide')
      };
    },[])

    //function for quit alert
    const createTwoButtonAlert = () =>
    Alert.alert(
      "Quit Test",
      "Are you sure you want to discard this test and quit?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Quit", onPress: navigation.goBack }
      ]
    );

    function handleNext(){
      clearInterval(interval)
      clearTimeout(timer)
      setTrialCount(trialCount+1)
      ref.current.clearSignature()
      setTrialState(true)
    }

  //subscribe to device angles
  useEffect(() => {
    const subscriber = Orientation.addListener(angleData => {
        setAngles(angleData)
      })
    return () => {
        subscriber.remove()
      };
  },[])

  //one second clock tick
  useEffect(() => {
      const tickInterval = setInterval(() => {
      if(testID>0){
          setTime(prevTime => prevTime + 1);
      } 
      }, 500);
      return () => clearInterval(tickInterval);
  }, [testID]);

  //function to write angles data to db
  async function writeAngles(testid,roll,pitch,yaw){
      const res1 = await db.execute("insert into deviceAngles (tid,pitch,roll,yaw) values (?,?,?,?)", [testid,pitch,roll,yaw])
      const res2 = await db.execute("select * from deviceAngles where tid = ?", [testid])
      console.log(res2.rows[res2.rows.length-1])
  }

  //initiate angleswrite function on tick
  useEffect(() => {
      if(time==1){
          Orientation.setUpdateInterval(200)
      }
      let pitch = ((((angles.pitch*180)/Math.PI)+180).toFixed(0))
      let roll = ((((angles.roll*180)/Math.PI)).toFixed(0))
      let yaw = ((((angles.yaw*180)/Math.PI)).toFixed(0))
      if(testID>0){
          writeAngles(testID,roll,pitch,yaw)
      }
  }, [time]);

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
      //ref.current.clearSignature()
      console.log(trialCount)
      if(trialCount==2){
        await db.execute("update summary set testStatus = ? where id = ?", [true, tid])
        navigation.dispatch(
          CommonActions.reset({
              index: 1,
              routes: [
              { name: 'Home' },
              {
                  name: 'swipeResultPage',
                  params:  {tid: tid, device: dev, product: prod, pid:pid,posture:posture,testHand,testHand}
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
      setCountdown(5)
      setTrialState(false)
      ref.current.getData()
      ref.current.readSignature()
    };
  
    // Called after ref.current.getData()
    async function handleData(data){
      data = JSON.parse(data);
      //console.log(data)
      var minX = Math.min.apply(null, data[0].points.map(function(a){return a.x;}))
         ,maxX = Math.max.apply(null, data[0].points.map(function(a){return a.x;}))
      var minY = Math.min.apply(null, data[0].points.map(function(a){return a.y;}))
         ,maxY = Math.max.apply(null, data[0].points.map(function(a){return a.y;}))
         await db.execute("insert into swipeResult (tid, yDP, xDP, trialNumber) values (?,?,?,?)",[tid, maxX-minX, maxY-minY, trialCount])
    };

    useEffect(() => {
      if(trialState==false && trialCount < 9){
        interval = setInterval(function(){
          if(countdown>-1){
              setCountdown(countdown => countdown-1)
          }
        }, 1000)
        timer = setTimeout(function(){
          handleNext()
        }, 5000);
      }
    },[trialState])

    //cleanup to clear timeouts on component unmount
    useEffect(() => {
        return () => {
            clearTimeout(timer);
            clearInterval(interval)
            };
    },[])
  
    return (

      <View style = {{...styles.container}}>
      <View pointerEvents={trialState==true?"auto":"none"} style = {{...styles.container, alignItems: "center", justifyContent: "flex-end"}}>
      <Text style={{position:"absolute", marginTop: "5%", zIndex: 30, fontSize: 25}}>Trial {trialCount+1<3?trialCount+1:3} of 3</Text>
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
      <View style={(trialState)?{...styles.viewDisabled}:{...styles.viewEnabled}}>
        <TouchableOpacity disabled = {trialState==false?false:true} style={(trialState)?{...styles.disabledNextButton}:{...styles.nextButton}} onPress={handleNext}>
          <Text>{trialState==false && trialCount < 2 ?'Next trial':'Swipe'}</Text>
        </TouchableOpacity>
        {trialState==false &&
        <TouchableOpacity style={(trialState)?{...styles.disabledNextButton}:{...styles.nextButton}} onPress={createTwoButtonAlert}>
          <Text>Quit</Text>
        </TouchableOpacity>
        }
      </View>
      {trialState==false && trialCount<9 &&
        <View style={{position:"absolute", bottom: "7%", zIndex: 30,alignSelf:"center",height:50,justifyContent:"center"}}>
          <Text>Next trial in {countdown}s</Text>
        </View>
      }
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
        padding: 5,
        borderRadius: 20,
        width:"20%"
      },
      disabledNextButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: "red",
        borderWidth: 2,
        backgroundColor: "#FDFDFD",
        elevation: 7,
        padding: 5,
        width:"100%",
        borderRadius: 20,
      },
      viewDisabled:{alignSelf:"center", position: "absolute", bottom: "7%", zIndex: 15, width: "20%", flexDirection:"row", justifyContent:"center"},
      viewEnabled:{alignSelf:"center", position: "absolute", bottom: "7%", zIndex: 15, width: "100%", flexDirection:"row", justifyContent:"space-around",height:50},
 }); 