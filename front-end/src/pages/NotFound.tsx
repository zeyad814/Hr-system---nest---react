import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* 404 Number */}
            <div className="text-6xl font-bold text-primary">
              404
            </div>
            
            {/* Arabic Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {t('errors.pageNotFound')}
              </h1>
              <p className="text-muted-foreground">
                {t('errors.pageNotFoundDesc')}
              </p>
            </div>

            {/* Current Path Info */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t('errors.requestedPath')}: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = "/"} 
                className="w-full"
              >
                <Home className="ml-2 h-4 w-4" />
                {t('errors.backToHome')}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full"
              >
                <ArrowRight className="ml-2 h-4 w-4 rotate-180" />
                {t('errors.backToPrevious')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
