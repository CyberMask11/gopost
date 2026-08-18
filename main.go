package main

import (
	"gopost/database"
	"gopost/handler"
	"gopost/middleware"
	"gopost/repository"
	"gopost/route"
	"gopost/service"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func middlewareLogger(c *gin.Context) {
	log.Println(c.Request.URL)
	c.Next()
}

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	if err := database.Connect(); err != nil {
		log.Fatal(err)
	}

	r := gin.Default()
	r.Use(middlewareLogger)
	r.Use(middleware.RateLimiter())
	r.Use(CORS())

	post_repo := repository.NewPostRepo(database.DB)
	post_service := service.NewPostService(post_repo)
	post_handler := handler.NewPostHandler(*post_service)

	repo := repository.NewRepo(database.DB)
	service := service.NewService(repo)
	handler := handler.NewHandler(service)

	route.Routes(r, handler)
	route.PostRoutes(r, post_handler)
	r.Run(":8080")
}
