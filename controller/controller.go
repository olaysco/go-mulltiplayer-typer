package controller

import (
	"net/http"
)

//Init setup static page controllers
func Init() {
	http.Handle("/src/", http.FileServer(http.Dir("public")))
	http.HandleFunc("/", homeHandler)
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "public/home.html")
}
