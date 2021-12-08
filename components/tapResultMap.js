import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, Dimensions  } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import Modal from "react-native-modal";
import {Database} from "../Database"

const db = new Database("result.db");

export const TapResult = (props) => {

    const navigation = useNavigation();
    const route = useRoute();
    const [xPos, setXPos] = useState([])
    const [isModalVisible, setModalVisible] = useState(false);
    const [isZoneVisible, setZoneVisible] = useState(false);
    const [BTitle, setBTitle] = useState("ZONES");
    let tid = route.params

    //function to toggle modal visibility
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
      };

    const toggleZones = () => {
        isZoneVisible ? setBTitle("ZONES") : setBTitle("HIDE")
        setZoneVisible(!isZoneVisible);
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (<View style={{flexDirection:"row"}}>
                <Button onPress={toggleZones} title = {BTitle}></Button>
                <Button onPress={toggleModal} title = "LEGEND"></Button>
                </View>)
        })
     }, [isZoneVisible])

    //function to run onMount
    useEffect(() => {

        let data = []
        async function generateData() {
            for(let i=0;i<100;i+=10){
                for(let j=0;j<100;j+=20){
                    //query data from db for results
                    const resultArr = await db.execute("select sum(rightClick) as rightCount, avg(timeTaken) as timeTaken from tapResult where tid = ? and xPos = ? and yPos = ?", [tid.params.tid, j, i])
                    let clr = resultArr.rows[0].rightCount == 2 ? "green" : resultArr.rows[0].rightCount == 1 ? "orange" : "red"
                    data.push({bottom: String(i) + "%", right: String(j) + "%", backgroundColor: clr, timeTaken: resultArr.rows[0].timeTaken.toFixed(2)})
                }
            }
            setXPos([...data]);
        }
        generateData()
    },[])

    return (
        <View style={{...styles.container}}>
            {xPos.map((datum, index) => (
                <TouchableOpacity key = {index} style={{...styles.roundButton, right: datum.right, bottom: datum.bottom, backgroundColor: datum.backgroundColor}}>
                    <Text>{datum.timeTaken}s</Text>
                </TouchableOpacity>
            ))}
            <Modal isVisible={isModalVisible}  hideModalContentWhileAnimating={true} useNativeDriver={true} animationIn="fadeIn" backdropTransitionInTiming={0} backdropColor="white" backdropOpacity={1} onBackButtonPress = {toggleModal} onBackdropPress = {toggleModal}>
                <View style={{ justifyContent: "center", alignItems: "center", flexDirection: "row"}}>
                    <TouchableOpacity style={{...styles.legendButton, backgroundColor:"red"}}>
                    </TouchableOpacity>
                    <Text>0 of 2 times pressed accurately</Text>
                </View>
                <View style={{justifyContent: "center", alignItems: "center", flexDirection: "row"}}>
                    <TouchableOpacity style={{...styles.legendButton, backgroundColor:"orange"}}>
                    </TouchableOpacity>
                    <Text>1 of 2 times pressed accurately</Text>
                </View>
                <View style={{justifyContent: "center", alignItems: "center", flexDirection: "row"}}>
                    <TouchableOpacity style={{...styles.legendButton, backgroundColor:"green"}}>
                    </TouchableOpacity>
                    <Text>2 of 2 times pressed accurately</Text>
                </View>
                <View style={{marginTop:15, justifyContent: "center", alignItems: "center", flexDirection: "row"}}>
                    <TouchableOpacity onPress={toggleModal} style={{...styles.closeButton}}>
                        <Text>CLOSE</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            {isZoneVisible ? 
            (<View style={{flex:1, backgroundColor: "red", position:"relative", justifyContent: "space-between"}}>
                <View>
                    <Text style={{fontSize:25, padding: 15, fontWeight:"bold"}}>Zone 2</Text>
                    <Text style={{fontSize:20, paddingLeft: 15}}>Accuracy: {tid.params.tdata[0][1]}%</Text>
                    <Text style={{fontSize:20, paddingLeft: 15}}>Mean Reaction Time: {tid.params.tdata[1][1]}s</Text>
                </View>
                <View style={{backgroundColor: "green", width:"60%", height:'50%', alignItems:"flex-start", alignSelf: "flex-end", position:"relative", justifyContent:"flex-start"}}>
                    <Text style={{fontSize:25, padding: 15, fontWeight:"bold"}}>Zone 1</Text>
                    <Text style={{fontSize:20, paddingLeft: 15}}>Accuracy: {tid.params.tdata[0][0]}%</Text>
                    <Text style={{fontSize:20, paddingLeft: 15}}>Mean Reaction Time: {tid.params.tdata[1][0]}s</Text>
                </View>
            </View>):null}
        </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
 
    roundButton: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        width: Dimensions.get('window').width * 0.2,
        height: Dimensions.get('window').width * 0.2,
    },
    legendButton: {
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        width: Dimensions.get('window').width * 0.2,
        height: Dimensions.get('window').width * 0.2,
    },
    closeButton: {
        elevation: 5,
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: "95%",
        height: 60,
        backgroundColor: '#d3d3d3',
    },
  });