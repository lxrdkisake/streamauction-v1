'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    theme: '',
    description: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.theme.trim() || !formData.description.trim()) {
      setError('Пожалуйста, заполните обязательные поля')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSubmitStatus('success')
        setFormData({ theme: '', description: '', email: '' })
      } else {
        setSubmitStatus('error')
        setError(result.error || 'Ошибка отправки')
      }
    } catch (err) {
      setSubmitStatus('error')
      setError('Ошибка сети')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
    setSubmitStatus('idle')
  }

  return (
    <div className="container-custom py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Обратная связь</h1>
          <p className="text-muted-foreground mt-2">
            Поделитесь своими идеями, сообщите об ошибках или предложите улучшения
          </p>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Спасибо за обратную связь!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Ваше сообщение успешно отправлено. Мы рассмотрим его в ближайшее время.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Форма обратной связи
            </CardTitle>
            <CardDescription>
              Все поля, кроме email, обязательны для заполнения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Theme */}
              <div className="space-y-2">
                <Label htmlFor="theme">
                  Тема сообщения <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="theme"
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  placeholder="Кратко опишите суть вашего сообщения"
                  className={cn(
                    error && !formData.theme.trim() && "border-destructive"
                  )}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Подробное описание <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Расскажите подробнее о вашей идее, проблеме или предложении..."
                  rows={6}
                  className={cn(
                    error && !formData.description.trim() && "border-destructive"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Минимум 10 символов, максимум 2000
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email для связи <span className="text-muted-foreground">(необязательно)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  Укажите email, если хотите получить ответ на ваше сообщение
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Отправляем...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Отправить сообщение
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Идеи и предложения</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Поделитесь идеями по улучшению функциональности, новыми фичами 
                или изменениями в интерфейсе.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🐛 Сообщения об ошибках</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Нашли баг или что-то работает не так, как ожидалось? 
                Опишите проблему максимально подробно.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Другие способы связи</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Если у вас срочный вопрос или вы предпочитаете другие способы связи:
            </p>
            <ul className="text-sm space-y-1">
              <li>• Telegram: @streamauction_support</li>
              <li>• Discord: StreamAuction Community</li>
              <li>• Email: support@streamauction.com</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}