namespace equation;

public class Equation
{
    public int id { get; set; }
    public string equation { get; set; }
    public int answer { get; set; }

    public Equation(int id, string equation, int answer)
    {
        this.id = id;
        this.equation = equation;
        this.answer = answer;
    }

    private static int GetRandomInt(int min, int max)
    {
        Random random = new Random();
        return random.Next(min, max + 1);
    }

    private static int GenerateId()
    {
        return 0; //TODO
    }

    private static Equation GenerateAddition()
    {
        int num1 = GetRandomInt(1, 20);
        int num2 = GetRandomInt(1, 20);
        return new Equation(GenerateId(), $"{num1} + {num2} = ?", num1 + num2);
    }

    private static Equation GenerateSubtraction()
    {
        int answer = GetRandomInt(1, 20);
        int num2 = GetRandomInt(1, 10);
        int num1 = answer + num2;
        return new Equation(GenerateId(), $"{num1} - {num2} = ?", answer);
    }

    private static Equation GenerateMultiplication()
    {
        int num1 = GetRandomInt(1, 12);
        int num2 = GetRandomInt(1, 12);
        return new Equation(GenerateId(), $"{num1} × {num2} = ?", num1 * num2);
    }

    private static Equation GenerateDivision()
    {
        int answer = GetRandomInt(1, 10);
        int num2 = GetRandomInt(1, 10);
        int num1 = answer * num2;
        return new Equation(GenerateId(), $"{num1} ÷ {num2} = ?", answer);
    }

    private static Equation GenerateEquation()
    {
        int operationType = GetRandomInt(1, 5);
        switch (operationType)
        {
            case 1:
                return GenerateAddition();
            case 2:
                return GenerateSubtraction();
            case 3:
                return GenerateMultiplication();
            case 4:
                return GenerateDivision();
            default:
                return GenerateAddition();
        }
    }

    public static Equation[] GenerateAllEquations(int count)
    {
        Equation[] equations = new Equation[count];
        for (int i = 0; i < count; i++)
        {
            equations[i] = GenerateEquation();
            equations[i].id = i;
        }
        return equations;
    }
}
