

using GuideX.Data;
using GuideX.Repository;
using GuideX.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// CORS
// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "http://localhost:3000") // ✅ ציין מקורות ספציפיים
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
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
builder.Services.AddScoped<ProfileRepository>();
builder.Services.AddScoped<RatingRepository>();


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
        // 🔍 דיאגנוסטיקה זמנית: מדפיס את סיבת הכשל המדויקת כאשר הטוקן נדחה (401).
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("🔴 JWT אימות נכשל: " + context.Exception?.GetType().Name + " — " + context.Exception?.Message);
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine("🟠 JWT Challenge (401): " + context.Error + " / " + context.ErrorDescription);
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization(options =>
{
    // כל ה-endpoints דורשים התחברות (טוקן) כברירת מחדל,
    // אלא אם endpoint מסוים מסומן ב-[AllowAnonymous].
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    // ✅ מנגנון כללי: מייצר policy לכל הרשאה מתוך ה-JSON שב-claim "Permissions".
    //    שם ה-policy חייב להתאים בדיוק לשם המפתח ב-JSON (לפי איך שהטוקן נבנה).
    string[] permissionNames =
    {
        "SuperAdmin",
        "UserManagement",
        "EditRoutes",
        "EditAttractions",
        "editHostels",
        "RespondInGeneralForum",
        "RespondInSafetyForum",
        "CanRate"
    };

    foreach (var name in permissionNames)
    {
        string policyName = name; // לכידת משתנה הלולאה למניעת closure bug
        options.AddPolicy(policyName, policy =>
            policy.RequireAssertion(ctx =>
            {
                var permissionsClaim = ctx.User?.FindFirst("Permissions")?.Value;
                if (string.IsNullOrWhiteSpace(permissionsClaim)) return false;

                using var doc = System.Text.Json.JsonDocument.Parse(permissionsClaim);
                return doc.RootElement.TryGetProperty(policyName, out var val)
                    && val.ValueKind == System.Text.Json.JsonValueKind.True;
            }));
    }
});

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


//if (app.Environment.IsDevelopment())
//{
//    app.MapOpenApi();
//    app.MapScalarApiReference();
//}


//app.UseHttpsRedirection();

//// ✅ CORS חייב לבוא לפני Authentication/Authorization כדי שה-preflight
////    של הדפדפן (OPTIONS) יקבל מענה תקין.
//app.UseCors("AllowAngular");

//app.UseAuthentication();
//app.UseAuthorization();


//app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();  // ✅ ראשון
}

app.UseHttpsRedirection();        // ✅ שני
app.UseCors("AllowAngular");      // ✅ שלישי (לפני auth)
app.UseAuthentication();          // ✅ רביעי
app.UseAuthorization();           // ✅ חמישי
app.MapControllers();             // ✅ שישי


app.Run();