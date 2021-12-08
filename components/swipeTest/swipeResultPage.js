import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Dimensions  } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Table, TableWrapper, Cell, Row, Rows, Col, Cols } from 'react-native-table-component';
import {Database} from "../../Database.js"
const { Parser } = require('json2csv');
const json2csvParser = new Parser();
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const db = new Database("result.db");

export const swipeResultPage = (props) => {
    const route = useRoute();
    const navigation = useNavigation();
    const [trialCol,setTrialCol] = useState([])
    const [sumWidth,setSumWidth] = useState([])
    const [participant, setParticipant] = useState(null)
    const [sumHeight,setSumHeight] = useState([])
    const [hwCol,sethwCol] = useState([])
    const [col1data,setcol1Data] = useState([])
    const [col2data,setcol2Data] = useState([])
    const [heightArray,setHeightArray] = useState([])

    async function downloadData() {
        let res = await db.execute("select (trialNumber+1) as Trial,xDP as heightDP,yDP as widthDP,xPX as heightPX,yPX as widthPX from swipeResult where tid = ?",[props.route.params.tid])
        const csv = json2csvParser.parse(res.rows);
        //console.log(csv);
        let prodNmae = props.route.params.product.replace(/\s/g, '');
        let partName = participant.replace(/\s/g, '');
        let filename = 'swipeResult_id_' + props.route.params.tid + '_' + props.route.params.device + '_' + prodNmae + '_' + partName + '.csv'; // or some other way to generate filename
        let filepath = `${FileSystem.documentDirectory}/${filename}`;
        await FileSystem.writeAsStringAsync(filepath, csv);
        await Sharing.shareAsync(filepath, { mimeType: 'text/csv' })
    }

    useEffect(() => {
        async function getData(){
            let colTrial = []
            let col1 = ['DP']
            let col2 = ['PX']
            let colHW = []
            let heightarray = [40]
            let res = await db.execute("select * from swipeResult where tid = ?",[props.route.params.tid])
            let res1 = await db.execute("select max(xDP) as maxXDP, min(xDP) as minXDP, avg(xDP) as avgXDP, max(xPX) as maxXPX, min(xPX) as minXPX, avg(xPX) as avgXPX from swipeResult where tid = ?",[props.route.params.tid])
            let res2 = await db.execute("select max(yDP) as maxYDP, min(yDP) as minYDP, avg(yDP) as avgYDP, max(yPX) as maxYPX, min(yPX) as minYPX, avg(yPX) as avgYPX from swipeResult where tid = ?",[props.route.params.tid])
            //console.log(res2.rows)
            setSumWidth(res1.rows)
            setSumHeight(res2.rows)
            res.rows.forEach(element => {
                col1.push(element.xDP.toFixed(0), element.yDP.toFixed(0))
                col2.push(element.xPX, element.yPX)
                colTrial.push((element.trialNumber+1))
                colHW.push('Height', 'Width')
                heightarray.push(30,30)
            });
            let res3 = await db.execute("select firstName, lastName from participants where id = ?",[props.route.params.pid])
            console.log(props.route.params.pid)
            setParticipant(res3.rows[0].firstName + " " + res3.rows[0].lastName)
            setTrialCol(colTrial)
            sethwCol(colHW)
            setcol1Data(col1)
            setcol2Data(col2)
            setHeightArray(heightarray)
        }
        getData()
    }, [props.route.params.tid]);
    return (
        <ScrollView style={{...styles.container}}>
            <View style={{margin: 7, alignItems: "center"}}>
                <Text style = {{fontSize: 20, fontWeight: "100"}}>Summary</Text>
            </View>
            <View style={{flexDirection:"row", margin: 17, justifyContent: "space-around"}}>
                <View style={{ backgroundColor: "#ececec", width:"45%", minHeight:200, elevation: 13, borderRadius: 20, justifyContent: "space-evenly", alignItems: "center"}}>
                    <Text style={{fontSize: 25, fontWeight:"bold"}}>Height</Text>
                    <Text style={{fontSize: 17, fontWeight:"bold"}}>Max</Text>
                    <Text>{sumWidth[0]?.maxXDP.toFixed(0)} DP / {sumWidth[0]?.maxXPX.toFixed(0)} PX</Text>
                    <Text style={{fontSize: 17, fontWeight:"bold"}}>Min</Text>
                    <Text>{sumWidth[0]?.minXDP.toFixed(0)} DP / {sumWidth[0]?.minXPX.toFixed(0)} PX</Text>
                    <Text style={{fontSize: 17, fontWeight:"bold"}}>Avg</Text>
                    <Text>{sumWidth[0]?.avgXDP.toFixed(0)} DP / {sumWidth[0]?.avgXPX.toFixed(0)} PX</Text>
                </View>
                <View style={{ backgroundColor: "#ececec", width:"45%", minHeight:200, elevation: 13, borderRadius: 20, justifyContent: "space-evenly", alignItems: "center"}}>
                    <Text style={{fontSize: 25, fontWeight:"bold"}}>Width</Text>
                    <Text style={{fontSize: 17, fontWeight:"bold"}}>Max</Text>
                    <Text>{sumHeight[0]?.maxYDP.toFixed(0)} DP / {sumHeight[0]?.maxYPX.toFixed(0)} PX</Text>
                    <Text style={{fontSize: 17, fontWeight:"bold"}}>Min</Text>
                    <Text>{sumHeight[0]?.minYDP.toFixed(0)} DP / {sumHeight[0]?.minYPX.toFixed(0)} PX</Text>
                    <Text style={{fontSize: 17, fontWeight:"bold"}}>Avg</Text>
                    <Text>{sumHeight[0]?.avgYDP.toFixed(0)} DP / {sumHeight[0]?.avgYPX.toFixed(0)} PX</Text>
                </View>
            </View>
            <View style ={{alignItems: 'center', borderWidth: 1, borderRadius:10, padding: 10, margin: 10}}>
                <Text style = {{fontWeight:'bold'}}>Device Tested: {props.route.params.device}</Text>
            </View>
            <View style ={{alignItems: 'center', borderWidth: 1, borderRadius:10, padding: 10, margin: 10}}>
                <Text style={{fontWeight:'bold'}}>Product Tested: {props.route.params.product}</Text>
            </View>
            <View style ={{alignItems: 'center', borderWidth: 1, borderRadius:10, padding: 10, margin: 10}}>
                <Text style={{fontWeight:'bold'}}>Participant: {participant}</Text>
            </View>
            <View style={{margin: 7, alignItems: "center"}}>
                <Text style = {{fontSize: 20, fontWeight: "100"}}>Result Table</Text>
            </View>
            <View style={{ backgroundColor: "#fff", margin: 2, elevation: 13, borderRadius: 20}}>
                <Table style={{flexDirection: 'row', margin: 16}} borderStyle={{borderWidth:1, borderColor: "#ececec"}}>
                <TableWrapper style={{width: 80}}>
                    <Cell data="" style={styles.singleHead}/>
                    <TableWrapper style={{flexDirection: 'row'}}>
                    <Col data={trialCol} style={styles.head} heightArr={60} textStyle={styles.text} />
                    <Col data={hwCol} style={styles.title} heightArr={[30, 30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]} textStyle={styles.titleText}></Col>
                    </TableWrapper>
                </TableWrapper>

                <TableWrapper style={{flex:1}}>
                    <Cols data={[col1data,col2data]} heightArr={heightArray} textStyle={styles.text}/>
                </TableWrapper>
                </Table>
            </View>
            <View style={{alignItems: "center", margin: 15, marginBottom: 60}}>
                <TouchableOpacity style={{...styles.roundButton}}>
                    <Text>View Detailed Results</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={downloadData} style={{...styles.roundButton}}>
                    <Text>Download Data</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress = {() => navigation.navigate('resultSelect')} style={{...styles.roundButton}}>
                    <Text>View Another Result</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 15, backgroundColor: '#fff' },
    singleHead: { width: 80, height: 40, backgroundColor: '#fff' },
    head: { flex: 1, backgroundColor: '#fff' },
    title: { flex: 2, backgroundColor: '#fff'},
    titleText: { marginRight: 6, textAlign:'right' },
    text: { textAlign: 'center' },
    roundButton: {
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