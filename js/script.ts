const canvas = <HTMLCanvasElement>document.getElementById("canvas");	// grab a reference to our canvas using its id
const context = canvas.getContext("2d");								// get context of the canvas

// CUSTOMIZATION

	// -> Net
	const netWidth = 4;
	const netHeight = canvas.height;

	// -> Paddles
	const paddleWidth = 10;
	const paddleHeight = 100;

	// -> Colors
	const backgroundColor = "#000";
	const elementsColor = "#FFF";

	// -> Sounds
	const hitSound = new Audio("../sounds/hitSound.wav");
	const scoreSound = new Audio("../sounds/scoreSound.wav");
	const wallHitSound = new Audio("../sounds/wallHitSound.wav");


// CLASSES

	// -> Paddle class, used by the ai and the user.
	class Paddle
	{
		x: number;
		y: number;
		score: number;

		constructor(x: number, y: number, score: number)
		{
			this.x = x;
			this.y = y;
			this.score = score;
		}
	}

	// -> Ball class.
	class Ball
	{
		x: number;
		y: number;
		speed: number;
		velocityX: number;
		velocityY: number;

		constructor(x: number, y: number, speed: number, velocityX: number, velocityY: number)
		{
			this.x = x;
			this.y = y;
			this.speed = speed;
			this.velocityX = velocityX;
			this.velocityY = velocityY;
		}
	};


// CONTROLS

let upArrowPressed = false;
let downArrowPressed = false;


// EVENT LISTENERS

window.addEventListener("keydown", (event) => {
	if (event.key == "ArrowUp")						// Checks if up_arrow key is pressed.
		upArrowPressed = true;
	else if (event.key == "ArrowDown")				// Checks if down_arrow key is pressed.
		downArrowPressed = true;
	return ;
});

window.addEventListener("keyup", (event) => {
	if (event.key == "ArrowUp")						// Checks if up_arrow key is released.
		upArrowPressed = false;
	else if (event.key == "ArrowDown")				// Checks if down_arrow key is released.
		downArrowPressed = false;
	return ;
});


// GAME FUNCTIONS

	// -> Ft_render function, will draw all the elements in the screen.
function ft_render( user: Paddle, ai: Paddle, ball: Ball )
{
	context.fillStyle = backgroundColor;													// Sets background color.
	context.fillRect(0, 0, canvas.width, canvas.height);									// Draws background.
	context.fillStyle = elementsColor;														// Sets elements color.
	context.font = "35px sans-serif";														// Sets font for text elements (score).
	context.fillRect(canvas.width / 2 - netWidth / 2, 0, netWidth, netHeight);				// Draws net.
	context.fillText(user.score.toString(), canvas.width / 4, canvas.height / 6);			// Draws user score.
	context.fillText(ai.score.toString(), 3 * canvas.width / 4, canvas.height / 6);			// Draws ai score.
	context.fillRect(user.x, user.y, paddleWidth, paddleHeight);							// Draws user paddle.
	context.fillRect(ai.x, ai.y, paddleWidth, paddleHeight);								// Draws ai paddle.
	context.beginPath();																	// Draws ball.
	context.arc(ball.x, ball.y, 7, 0, Math.PI * 2, true);
	context.closePath();
	context.fill();

	return ;
}

	// -> Ft_resetBallPos, resets all the values of ball object.
function ft_resetBallPos(ball: Ball)
{
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.speed = 7;
	ball.velocityX = -ball.velocityX;					// Movement is inverted
	ball.velocityY = -ball.velocityY;

	return ;
}

	// -> Ft_paddleCollision, checks if the ball collides with the user/ai paddle.
function ft_paddleCollision( paddle : Paddle, ball: Ball ) : boolean				
{
	let ballTop = ball.y - 7;							// Calculates ball position.
	let ballBottom = ball.y + 7;
	let ballRight = ball.x + 7;
	let ballLeft = ball.x - 7;

	let paddleTop = paddle.y;							// Calculates paddle position.
	let paddleRight = paddle.x + paddleWidth;
	let paddleBottom = paddle.y + paddleHeight;
	let paddleLeft = paddle.x;
  
	return (ballLeft < paddleRight && ballTop < paddleBottom && ballRight > paddleLeft && ballBottom > paddleTop);
}

	// -> Ft_update function, data is updated so ft_render can draw a new frame.
function ft_update( user: Paddle, ai: Paddle, ball: Ball )
{
	ball.x += ball.velocityX;													// Ball position is updated.
	ball.y += ball.velocityY;

	if (upArrowPressed && user.y > 0)											// Handles user movement.
		user.y -= 8;
	else if (downArrowPressed && (user.y < canvas.height - paddleHeight))
		user.y += 8;
	
	if (ball.y + 7 >= canvas.height || ball.y - 7 <= 0)							// Handles Y collisions.
	{
		wallHitSound.play();
		ball.velocityY = -ball.velocityY;
	}

	if (ball.x + 7 >= canvas.width)												// Handles X collisions and points.
	{
		scoreSound.play();
		user.score += 1;
		ft_resetBallPos(ball);
	}
	if (ball.x - 7 <= 0)
	{
		scoreSound.play();
		ai.score += 1;
		ft_resetBallPos(ball);
	}

	let paddle: Paddle;															// Checks in what side will be the ball and references the correspondant paddle.
	if (ball.x <= canvas.width / 2)
		paddle = user;
	else
		paddle = ai;

	if (ft_paddleCollision(paddle, ball))										// Detects if a collision happends and changes the angle and direction of the ball.
	{
		hitSound.play();
		let angle = 0;															// Changes angle.
		if (ball.y < (paddle.y + paddleHeight / 2))
			angle = -(Math.PI / 4);
		else if (ball.y > (paddle.y + paddleHeight / 2))
			angle = Math.PI / 4;
		let dir = -1;															// Changes direction.
		if (paddle == user)
			dir = 1;
		ball.velocityX = dir * ball.speed * Math.cos(angle);
	    ball.velocityY = ball.speed * Math.sin(angle);
	    ball.speed += 0.2;														// Changes speed.		
	}

	ai.y += ((ball.y - (ai.y + paddleHeight / 2))) * 0.09;						// "Ai".
}

	// -> Ft_gameloop function, ft_update and ft_render are called each loop.
function ft_gameLoop( user: Paddle, ai: Paddle, ball: Ball )
{
	ft_update(user, ai, ball);			// Executes ft_update function.
	ft_render(user, ai, ball);			// Executes ft_render function.
	return ;
}


// MAIN
let user = new Paddle(10, canvas.height / 2 - paddleHeight / 2, 0);								
let ai = new Paddle(canvas.width - (paddleWidth + 10), canvas.height / 2 - paddleHeight / 2, 0)
let ball = new Ball(canvas.width / 2, canvas.height / 2, 7, 5, 5);
setInterval(ft_gameLoop, 1000 / 60, user, ai, ball);


