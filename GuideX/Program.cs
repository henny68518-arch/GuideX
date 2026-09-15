

using GuideX.Data;
using GuideX.Repository;
using GuideX.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Controllers
builder.Services.AddControllers();

// OpenAPI
builder.Services.AddOpenApi();

// Database
builder.Services.AddDbContext<GuideXpContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<GuideRepository>();
builder.Services.AddScoped<AttractionRepository>(); 
builder.Services.AddScoped<AllRepository>();
builder.Services.AddScoped<ForumRepository>();
builder.Services.AddScoped<CoordinatorRepository>();


// Services
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<loginService>();
builder.Services.AddScoped<GuideService>();
builder.Services.AddScoped<ForumService>();
builder.Services.AddScoped<CoordinatorService>();


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            //ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidIssuer = "GuideX",
            ValidAudience = "angular",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]))
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    try
    {
        Console.WriteLine("🔍 מנסה להתחבר לשרת...");

        string connString = builder.Configuration.GetConnectionString("DefaultConnection")!;
        Console.WriteLine($"📝 Connection String: {connString}");

        using (SqlConnection conn = new SqlConnection(connString))
        {
            conn.Open();
            Console.WriteLine("✅ חיבור הצליח!");

            using (SqlCommand cmd = new SqlCommand("SELECT @@VERSION", conn))
            {
                string version = cmd.ExecuteScalar()?.ToString() ?? "Unknown";
                Console.WriteLine($"📊 SQL Server: {version}");
            }
        }
    }
    catch (SqlException ex)
    {
        Console.WriteLine($"❌ שגיאת SQL: {ex.Number}");
        Console.WriteLine($"❌ הודעה: {ex.Message}");
        Console.WriteLine($"❌ InnerException: {ex.InnerException?.Message}");
        throw;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ שגיאה כללית: {ex.Message}");
        throw;
    }
}


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}


app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();



app.UseCors("AllowAngular");


app.MapControllers();


app.Run();