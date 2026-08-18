package route

import (
	"gopost/handler"
	"gopost/middleware"

	"github.com/gin-gonic/gin"
)

func Routes(r *gin.Engine, h *handler.UserHandler) {
	r.POST("/register", h.Register)
	r.GET("/users", middleware.AuthJwt(), h.GetUsers)
	r.PUT("/update/:id", middleware.AuthJwt(), h.UpdateUser)
	r.DELETE("/delete/:id", middleware.AuthJwt(), h.DeleteUser)
	r.POST("/login", h.Login)
	r.POST("/refreshtoken", h.RefreshToken)
}

func PostRoutes(r *gin.Engine, h *handler.PostHandler) {
	r.POST("/post", middleware.AuthJwt(), h.CreatePost)
	r.GET("/posts", middleware.AuthJwt(), h.GetPosts)
	r.GET("/post/:id", middleware.AuthJwt(), h.GetPost)
	r.PUT("/postupdate/:id", middleware.AuthJwt(), h.UpdatePost)
	r.DELETE("/postdelete/:id", middleware.AuthJwt(), h.DeletePost)
}
