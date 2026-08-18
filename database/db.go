package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() error {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	conn := "host=" + host +
		" port=" + port +
		" user=" + user +
		" password=" + password +
		" dbname=" + dbname +
		" sslmode=disable"

	db, err := sql.Open("postgres", conn)
	if err != nil {
		return err
	}

	for i := 1; i <= 10; i++ {
		if err := db.Ping(); err != nil {
			log.Printf("database not ready (attempt %d/10): %v", i, err)
			time.Sleep(2 * time.Second)
			continue
		}

		DB = db
		log.Println("Connected to database.")
		return nil
	}

	return fmt.Errorf("could not connect to database after 10 attempts")
}
