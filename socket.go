package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/olaysco/websock/controller"

	"golang.org/x/net/websocket"

	"github.com/olaysco/websock/rand"
)

type message struct {
	Channel string      `json:"channel"`
	Data    interface{} `json:"data"`
}

type errorMessage struct {
	reason string
}

type participant struct {
	Username string
	ID       string
	ws       *websocket.Conn
	Score    int
}

type room struct {
	ID           string
	Participants []*participant
}

var rooms map[string]*room = make(map[string]*room)
var gameWords = []string{"ss", "ddd"}

func main() {
	http.Handle("/socket", websocket.Handler(Echo))
	controller.Init()

	if err := http.ListenAndServe(":1234", nil); err != nil {
		log.Fatal("Listening and serving ", err)
	}
}

//Echo handkes the ws s\connection
func Echo(ws *websocket.Conn) {
	var err error

	//this loop is to allows us to keep listening fotr request
	//and sending back response
	for {
		var reply string
		var replyJSON message
		err = websocket.Message.Receive(ws, &reply)
		if err != nil {
			break
		}
		replyByte := []byte(reply)
		err := json.Unmarshal(replyByte, &replyJSON)
		if err != nil {
			fmt.Println("Can't decode data", err.Error())
			break
		}
		// fmt.Println("Json Received from client: ", replyJSON)
		handleMessage(ws, &replyJSON)
	}
}

func handleMessage(ws *websocket.Conn, msg *message) {
	data := msg.Data.(map[string]interface{})
	switch msg.Channel {
	case "create":
		go createRoom(ws, data)
	case "join":
		go joinRoom(ws, data)
	case "start":
		go start(ws, data)
	case "score":
		go sendScore(ws, data)
	}
}

func sendScore(ws *websocket.Conn, data map[string]interface{}) {
	roomID := fmt.Sprintf("%v", data["id"])
	clientID := fmt.Sprintf("%v", data["client"])
	score := fmt.Sprintf("%v", data["score"])
	m := make(map[string]interface{})
	m["client"] = clientID
	m["score"] = score
	msg := message{
		Channel: "newscore",
		Data:    m,
	}
	go broadcastOthers(roomID, &msg, clientID)

}

func start(ws *websocket.Conn, data map[string]interface{}) {
	roomID := fmt.Sprintf("%v", data["id"])
	m := make(map[string]interface{})
	m["words"] = gameWords
	broadcastMsg := message{
		Channel: "started",
		Data:    m,
	}
	go broadcast(roomID, &broadcastMsg)
}

func createRoom(ws *websocket.Conn, data map[string]interface{}) {
	username := fmt.Sprintf("%v", data["username"])
	roomID := rand.String(5)
	newroom := room{
		ID:           roomID,
		Participants: make([]*participant, 0, 5),
	}
	rooms[newroom.ID] = &newroom
	newID := addParticipantToRoom(ws, &newroom, username)
	m := make(map[string]interface{})
	m["room"] = &newroom
	m["id"] = newID
	reply := message{
		Channel: "created",
		Data:    &m,
	}
	replyStr, _ := json.Marshal(reply)
	websocket.Message.Send(ws, replyStr)
}

func joinRoom(ws *websocket.Conn, data map[string]interface{}) {
	roomID := fmt.Sprintf("%v", data["id"])
	username := fmt.Sprintf("%v", data["username"])
	if room, exist := rooms[roomID]; exist {
		newID := addParticipantToRoom(ws, room, username)
		m := make(map[string]interface{})
		m["room"] = &room
		m["id"] = newID
		reply := message{
			Channel: "joined",
			Data:    &m,
		}
		replyStr, _ := json.Marshal(reply)
		websocket.Message.Send(ws, replyStr)
		broadcastMsg := message{
			Channel: "newplayer",
			Data:    m,
		}
		broadcast(roomID, &broadcastMsg)
	} else {
		sendError(ws, "joinError", "game id not available")
	}
}

func addParticipantToRoom(ws *websocket.Conn, room *room, username string) string {
	np := new(participant)
	np.Username = username
	np.ID = rand.String(5)
	np.ws = ws
	np.Score = 0
	room.Participants = append(room.Participants, np)
	return np.ID
}

func getClientFromRoom(roomID string, clientID string) (*participant, bool) {
	participants := &rooms[roomID].Participants
	exist := false
	var p *participant = new(participant)
	for _, pt := range *participants {
		if pt.ID == clientID {
			exist = true
			p = pt
			break
		}
	}
	return p, exist
}

func broadcast(roomID string, msg *message) {
	participants := &rooms[roomID].Participants
	msgStr, _ := json.Marshal(msg)
	for _, participant := range *participants {
		err := websocket.Message.Send(participant.ws, msgStr)
		if err != nil {
			fmt.Println("Can't send")
		}
	}
}

func broadcastOthers(roomID string, msg *message, clientID string) {
	participants := &rooms[roomID].Participants
	fmt.Println(participants)
	msgStr, _ := json.Marshal(msg)
	for _, participant := range *participants {
		if clientID != participant.ID {
			fmt.Println("sending to ", participant.ID)
			err := websocket.Message.Send(participant.ws, msgStr)
			if err != nil {
				fmt.Println("Can't send")
			}
		}
	}
}

func sendError(ws *websocket.Conn, errorChannel string, err string) {
	errorData := &errorMessage{
		reason: err,
	}
	reply := message{
		Channel: errorChannel,
		Data:    &errorData,
	}
	replyStr, _ := json.Marshal(reply)
	websocket.Message.Send(ws, replyStr)
}

func compactSlice(slc []*participant) []*participant {
	newSlc := make([]*participant, 0, len(slc))
	for _, v := range slc {
		newSlc = append(newSlc, v)
	}
	return newSlc
}
func handleError() {}
