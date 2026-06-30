import { ExampleCode } from "./types";

export const LEGACY_EXAMPLES: ExampleCode[] = [
  {
    id: "cobol-records",
    title: "COBOL: Customer Record Processor",
    description: "Verbose data division, physical file reading, sequential processing, and nested GOTO/IF-based control flow typical of legacy mainframes.",
    sourceLang: "COBOL",
    targetLang: "Go",
    suggestedOptions: ["Performance Optimization Pass", "Strict Type Safety", "Concurrency Refactoring"],
    code: `IDENTIFICATION DIVISION.
PROGRAM-ID. CUSTPROC.
AUTHOR. OLD-SYSTEMS-TEAM.

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT CUST-FILE ASSIGN TO "CUSTOMERS.DAT"
        ORGANIZATION IS SEQUENTIAL.
    SELECT REPORT-FILE ASSIGN TO "REPORT.TXT".

DATA DIVISION.
FILE SECTION.
FD  CUST-FILE.
01  CUST-RECORD.
    05  CUST-ID          PIC X(8).
    05  CUST-NAME        PIC X(30).
    05  CUST-BALANCE     PIC 9(6)V99.
    05  CUST-STATUS      PIC X(1).

FD  REPORT-FILE.
01  PRINT-LINE          PIC X(80).

WORKING-STORAGE SECTION.
01  WS-FLAGS.
    05  WS-EOF-FLAG      PIC X(1) VALUE 'N'.
01  WS-TOTALS.
    05  WS-TOTAL-BAL     PIC 9(8)V99 VALUE ZERO.
    05  WS-ACTIVE-COUNT  PIC 9(5) VALUE ZERO.

PROCEDURE DIVISION.
0000-MAIN.
    OPEN INPUT CUST-FILE
    OPEN OUTPUT REPORT-FILE
    
    PERFORM 1000-READ-RECORD UNTIL WS-EOF-FLAG = 'Y'
    
    PERFORM 2000-WRITE-SUMMARY
    
    CLOSE CUST-FILE
    CLOSE REPORT-FILE
    STOP RUN.

1000-READ-RECORD.
    READ CUST-FILE
        AT END
            MOVE 'Y' TO WS-EOF-FLAG
        NOT AT END
            IF CUST-STATUS = 'A'
                ADD CUST-BALANCE TO WS-TOTAL-BAL
                ADD 1 TO WS-ACTIVE-COUNT
                PERFORM 1500-PROCESS-ACTIVE
            ELSE
                IF CUST-STATUS = 'I' AND CUST-BALANCE > 5000.00
                    DISPLAY "ALERT: HIGH BALANCE INACTIVE CUST: " CUST-ID
                END-IF
            END-IF
    END-READ.

1500-PROCESS-ACTIVE.
    DISPLAY "PROCESSING STAGE 1 FOR ACTIVE CUST: " CUST-NAME
    IF CUST-BALANCE > 10000.00
        DISPLAY "UPGRADING CUST STATUS TO PREMIUM"
    END-IF.

2000-WRITE-SUMMARY.
    DISPLAY "--- SUMMARY REPORT ---"
    DISPLAY "TOTAL BALANCES: " WS-TOTAL-BAL
    DISPLAY "ACTIVE CUSTOMERS: " WS-ACTIVE-COUNT.
`
  },
  {
    id: "java-cache",
    title: "Java 6: Synchronized Multi-Threaded Queue",
    description: "Thread synchronization using raw synchronized blocks, legacy Vector and Stack structures, manual thread pooling, and unsafe casting.",
    sourceLang: "Java 6",
    targetLang: "Go",
    suggestedOptions: ["Concurrency Refactoring", "Performance Optimization Pass", "Security & Memory-Safety Audit"],
    code: `package com.legacy.cache;

import java.util.Vector;
import java.util.Enumeration;

public class SynchronizedTaskQueue {
    private Vector tasks = new Vector(); // Raw types, legacy synchronized container
    private final int limit;

    public SynchronizedTaskQueue(int limit) {
        this.limit = limit;
    }

    public synchronized void enqueue(Object task) throws InterruptedException {
        while (this.tasks.size() == this.limit) {
            wait(); // Raw monitor wait
        }
        if (this.tasks.size() == 0) {
            notifyAll();
        }
        this.tasks.addElement(task);
    }

    public synchronized Object dequeue() throws InterruptedException {
        while (this.tasks.size() == 0) {
            wait();
        }
        if (this.tasks.size() == this.limit) {
            notifyAll();
        }
        Object obj = this.tasks.firstElement();
        this.tasks.removeElementAt(0);
        return obj;
    }

    // Dangerous unchecked enumeration and iteration over a mutating collection
    public void dumpTasks() {
        synchronized(tasks) {
            Enumeration e = tasks.elements();
            while (e.hasMoreElements()) {
                Object t = e.nextElement();
                System.out.println("Processing Task: " + t.toString());
            }
        }
    }
}
`
  },
  {
    id: "fortran-math",
    title: "Fortran 77: Numerical Matrix Solver",
    description: "Legacy scientific computation with 1-based index offsets, GOTO-based conditional loops, and heavy global arrays.",
    sourceLang: "Fortran 77",
    targetLang: "Python 3.12",
    suggestedOptions: ["Performance Optimization Pass", "Strict Type Safety"],
    code: `      PROGRAM MATSOLV
      INTEGER N, I, J, K
      PARAMETER (N=10)
      DOUBLE PRECISION A(N,N), B(N), X(N), FACTOR
      
C     INITIALIZE DATA
      DO 10 I = 1, N
        DO 20 J = 1, N
          IF (I .EQ. J) THEN
            A(I,J) = 5.0D0
          ELSE
            A(I,J) = 1.0D0
          ENDIF
20      CONTINUE
        B(I) = I * 1.5D0
10    CONTINUE

C     GAUSSIAN ELIMINATION WITH ZERO STRUCTURAL BOUNDS CHECK
      DO 100 K = 1, N-1
        DO 200 I = K+1, N
          FACTOR = A(I,K) / A(K,K)
          DO 300 J = K, N
            A(I,J) = A(I,J) - FACTOR * A(K,J)
300       CONTINUE
          B(I) = B(I) - FACTOR * B(K)
200     CONTINUE
100   CONTINUE

C     BACK SUBSTITUTION
      X(N) = B(N) / A(N,N)
      DO 400 I = N-1, 1, -1
        FACTOR = 0.0D0
        DO 500 J = I+1, N
          FACTOR = FACTOR + A(I,J) * X(J)
500     CONTINUE
        X(I) = (B(I) - FACTOR) / A(I,I)
400   CONTINUE

C     PRINT OUT RESULTS
      WRITE(*,*) 'SOLVED VECTOR X:'
      DO 600 I = 1, N
        WRITE(*,*) 'X(', I, ') = ', X(I)
600   CONTINUE

      STOP
      END
`
  },
  {
    id: "php-mysql",
    title: "PHP 5.4: Vulnerable User DB Handler",
    description: "Highly insecure database queries relying on direct string concatenation, vulnerable to SQL Injection, lacking typed parameters, and using deprecated API hooks.",
    sourceLang: "PHP 5.4",
    targetLang: "TypeScript",
    suggestedOptions: ["Security & Memory-Safety Audit", "Strict Type Safety", "Performance Optimization Pass"],
    code: `<?php
// Deprecated, insecure connection logic
function getUserData($userId, $userRole) {
    $conn = mysql_connect("localhost", "db_user", "hardcoded_password123");
    mysql_select_db("enterprise_db", $conn);

    // CRITICAL: Unsanitized SQL injection vector
    $query = "SELECT * FROM users WHERE id = '" . $userId . "' AND role = '" . $userRole . "'";
    $result = mysql_query($query, $conn);

    if (!$result) {
        die("Database query failed: " . mysql_error());
    }

    $rows = array();
    while ($row = mysql_fetch_assoc($result)) {
        $rows[] = $row;
    }

    mysql_close($conn);
    return $rows;
}

// Deprecated global logging with file lock contention
function logAccess($msg) {
    global $logFile;
    $fp = fopen("/var/log/enterprise_app.log", "a");
    fwrite($fp, "[" . date("Y-m-d H:i:s") . "] " . $msg . "\\n");
    fclose($fp);
}
?>
`
  }
];
