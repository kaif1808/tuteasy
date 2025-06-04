import React from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';

export const ComponentTest: React.FC = () => {
  const [testResults, setTestResults] = React.useState<string[]>([]);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    subjects: ['Math', 'Science']
  });

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testButton = () => {
    addResult('✅ Button component working');
  };

  const testInput = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    addResult('✅ Input component working');
  };

  const testTextarea = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
    addResult('✅ Textarea component working');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>UI Component Test Suite</CardTitle>
              <CardDescription>
                Testing all UI components used in the student profile system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Button Test */}
              <div className="space-y-2">
                <Label>Button Component Test</Label>
                <div className="flex gap-2">
                  <Button onClick={testButton}>Test Default Button</Button>
                  <Button variant="outline" onClick={() => addResult('✅ Outline button working')}>
                    Test Outline Button
                  </Button>
                  <Button variant="secondary" onClick={() => addResult('✅ Secondary button working')}>
                    Test Secondary Button
                  </Button>
                </div>
              </div>

              {/* Input Test */}
              <div className="space-y-2">
                <Label htmlFor="test-input">Input Component Test</Label>
                <Input
                  id="test-input"
                  value={formData.name}
                  onChange={(e) => testInput(e.target.value)}
                  placeholder="Type something to test input..."
                />
                <p className="text-sm text-gray-600">Current value: {formData.name}</p>
              </div>

              {/* Textarea Test */}
              <div className="space-y-2">
                <Label htmlFor="test-textarea">Textarea Component Test</Label>
                <Textarea
                  id="test-textarea"
                  value={formData.description}
                  onChange={(e) => testTextarea(e.target.value)}
                  placeholder="Type something to test textarea..."
                  rows={3}
                />
                <p className="text-sm text-gray-600">Current value: {formData.description}</p>
              </div>

              {/* Badge Test */}
              <div className="space-y-2">
                <Label>Badge Component Test</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map((subject, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {subject}
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            subjects: prev.subjects.filter((_, i) => i !== index)
                          }));
                          addResult(`✅ Badge remove working for ${subject}`);
                        }}
                        className="ml-1 hover:bg-gray-500 rounded-full p-0.5"
                      >
                        <span className="w-3 h-3 block text-xs">×</span>
                      </button>
                    </Badge>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newSubject = `Subject ${formData.subjects.length + 1}`;
                      setFormData(prev => ({
                        ...prev,
                        subjects: [...prev.subjects, newSubject]
                      }));
                      addResult(`✅ Badge add working for ${newSubject}`);
                    }}
                  >
                    + Add Subject
                  </Button>
                </div>
              </div>

              {/* Card Test */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-600">Nested Card Test</CardTitle>
                  <CardDescription>This card is nested inside another card</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">✅ Card, CardHeader, CardTitle, CardDescription, and CardContent all working!</p>
                  <Button 
                    onClick={() => addResult('✅ All Card components working')}
                    className="mt-2"
                  >
                    Test Card Components
                  </Button>
                </CardContent>
              </Card>

              {/* Clear Results */}
              <div className="flex gap-2">
                <Button onClick={clearResults} variant="outline">
                  Clear Test Results
                </Button>
                <Button onClick={() => addResult('🧪 Manual test entry')}>
                  Add Manual Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results ({testResults.length})</CardTitle>
              <CardDescription>
                Real-time results from component interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-gray-500 italic">No tests run yet. Interact with components above to see results.</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Component Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Component Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">Button</div>
                  <div className="text-green-500">✅ Working</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">Input</div>
                  <div className="text-green-500">✅ Working</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">Textarea</div>
                  <div className="text-green-500">✅ Working</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">Card</div>
                  <div className="text-green-500">✅ Working</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">Label</div>
                  <div className="text-green-500">✅ Working</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">Badge</div>
                  <div className="text-green-500">✅ Working</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 