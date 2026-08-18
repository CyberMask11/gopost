package handler

import (
	"gopost/models"
	"gopost/service"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	service *service.UserService
}

func NewHandler(service *service.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (s *UserHandler) Register(c *gin.Context) {
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		validationErrors, ok := err.(validator.ValidationErrors)

		if ok {
			for _, fieldError := range validationErrors {
				switch {
				case fieldError.Tag() == "required" && fieldError.Field() == "Password":
					c.JSON(400, gin.H{"error": "Password Required"})

				case fieldError.Tag() == "min":
					c.JSON(400, gin.H{"error": "Password must be atleast 8 characters."})

				case fieldError.Field() == "Username":
					c.JSON(400, gin.H{"error": "Username Required."})
				}
			}
		}
		return
	}

	_, err := s.service.CreateUser(user)
	if err != nil {
		c.IndentedJSON(400, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(201, gin.H{"user": user.Username})
}

func (s *UserHandler) GetUsers(c *gin.Context) {
	getUsers, err := s.service.GetUsers()
	if err != nil {
		c.JSON(404, gin.H{
			"error": err,
		})
		return
	}

	sanitized := make([]models.User, len(getUsers))
	for i, u := range getUsers {
		u.Password = ""
		sanitized[i] = u
	}

	c.IndentedJSON(200, sanitized)
}

func (s *UserHandler) UpdateUser(c *gin.Context) {
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	userid, _ := c.Get("userid")
	role, _ := c.Get("role")

	id := c.Param("id")

	result, err := s.service.UpdateUser(user, id, userid.(string), role.(string))
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(404, "Alas, User not found.")
		return
	}

	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.String(200, "User updated.")

}

func (s *UserHandler) DeleteUser(c *gin.Context) {
	userid, _ := c.Get("userid")
	role, _ := c.Get("role")
	id := c.Param("id")

	if err := s.service.DeleteUser(id, userid.(string), role.(string)); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.String(200, "User Deleted.")
}

func (s *UserHandler) Login(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		validationErrors, ok := err.(validator.ValidationErrors)

		if ok {
			for _, fieldError := range validationErrors {
				switch {
				case fieldError.Field() == "Password" && fieldError.Tag() == "required":
					c.JSON(400, gin.H{"error": "Password Required."})

				case fieldError.Tag() == "min":
					c.JSON(400, gin.H{"error": "Password must be atleast 8 characters."})

				case fieldError.Field() == "Username":
					c.JSON(400, gin.H{"error": "Username Required."})
				}
			}
		}

		return
	}

	token, refresh_token, err := s.service.Login(user)
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}

	c.IndentedJSON(200, gin.H{"token": token, "refresh_token": refresh_token})
}

func (s *UserHandler) RefreshToken(c *gin.Context) {
	var data models.Data

	if err := c.BindJSON(&data); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	token, err := s.service.RefreshToken(data.Refresh_Token)
	if err != nil {
		c.JSON(400, gin.H{"error": gin.H{"error": err.Error()}})
		return
	}

	c.IndentedJSON(200, gin.H{"token": token})
}
