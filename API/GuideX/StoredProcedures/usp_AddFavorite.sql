USE [GuideXP]
GO

/******
  פרוצדורה: usp_AddFavorite
  תפקיד: הוספת מועדף חדש, או החזרת המועדף הקיים אם כבר קיים כפיל.
  פלט:
    @FavoriteId INT = מזהה המועדף (חדש או קיים)
    @IsNew BIT   = 1 אם נוצר חדש, 0 אם כבר היה קיים
******/
IF OBJECT_ID(N'dbo.usp_AddFavorite', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_AddFavorite;
GO

CREATE PROCEDURE dbo.usp_AddFavorite
    @UserId INT,
    @AttractionsId INT = NULL,
    @HostelsId INT = NULL,
    @WalkingTrailId INT = NULL,
    @FavoriteId INT = NULL OUTPUT,
    @IsNew BIT = 0 OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- שלב 1: תקינות — צריך לפחות פריט אחד משלושת הסוגים.
    IF @AttractionsId IS NULL AND @HostelsId IS NULL AND @WalkingTrailId IS NULL
    BEGIN
        THROW 50001, N'לא צוין פריט למועדף', 1;
    END

    -- שלב 2: בדיקת כפילות לפי אותו שילוב שמישמש בקונטרולר.
    SELECT @FavoriteId = FavoriteId
    FROM dbo.Favorites
    WHERE UserId = @UserId
      AND AttractionsId = @AttractionsId
      AND HostelsId = @HostelsId
      AND WalkingTrailId = @WalkingTrailId;

    IF @FavoriteId IS NOT NULL
    BEGIN
        -- כבר קיים — מחזירים אותו בלי ליצור כפיל.
        SET @IsNew = 0;
        RETURN;
    END

    -- שלב 3: הוספת המועדף החדש.
    INSERT INTO dbo.Favorites (UserId, AttractionsId, HostelsId, WalkingTrailId)
    VALUES (@UserId, @AttractionsId, @HostelsId, @WalkingTrailId);

    SET @FavoriteId = SCOPE_IDENTITY();
    SET @IsNew = 1;
END
GO
