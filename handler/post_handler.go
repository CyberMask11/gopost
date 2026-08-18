package handler

import (
	"gopost/models"
	"gopost/service"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type PostHandler struct {
	service service.PostService
}

func NewPostHandler(service service.PostService) *PostHandler {
	return &PostHandler{service: service}
}

func (s *PostHandler) CreatePost(c *gin.Context) {
	var post models.Post

	if err := c.ShouldBindJSON(&post); err != nil {
		validationErrors, ok := err.(validator.ValidationErrors)

		if ok {
			for _, fieldError := range validationErrors {
				switch {
				case fieldError.Field() == "Title":
					c.JSON(400, gin.H{"error": "Title Required."})

				case fieldError.Field() == "Content":
					c.JSON(400, gin.H{"error": "Content Required."})
				}
			}
		}

		return
	}

	userid, _ := c.Get("userid")
	username, _ := c.Get("username")

	if err := s.service.CreatePost(post, username.(string), userid.(uuid.UUID)); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, gin.H{"post": "Post Created."})
}

func (s *PostHandler) GetPosts(c *gin.Context) {
	posts, err := s.service.GetPosts()

	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"posts": posts})
}

func (s *PostHandler) GetPost(c *gin.Context) {
	id := c.Param("id")

	post, err := s.service.GetPost(id)

	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"Post": post})
}

func (s *PostHandler) UpdatePost(c *gin.Context) {
	var post models.Post

	if err := c.ShouldBindJSON(&post); err != nil {
		validationErrors, ok := err.(validator.ValidationErrors)

		if ok {
			for _, fieldError := range validationErrors {
				switch {
				case fieldError.Field() == "Title":
					c.JSON(400, gin.H{"error": "Title Required."})

				case fieldError.Field() == "Content":
					c.JSON(400, gin.H{"error": "Content Required."})
				}
			}
		}

		return
	}

	userid, _ := c.Get("userid")
	role, _ := c.Get("role")
	id := c.Param("id")

	update, err := s.service.UpdatePost(post, id, userid.(uuid.UUID), role.(string))
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"Updated": update})
}

func (s *PostHandler) DeletePost(c *gin.Context) {
	userid, _ := c.Get("userid")
	role, _ := c.Get("role")

	id := c.Param("id")

	if err := s.service.DeletePost(id, userid.(uuid.UUID), role.(string)); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"delete": "Post deleted."})
}
